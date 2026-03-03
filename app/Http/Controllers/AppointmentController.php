<?php

namespace App\Http\Controllers;

use App\Jobs\SendAppointmentReminderJob;
use App\Models\Appointment;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $date = $request->input('date', now()->toDateString());

        $appointments = Appointment::with(['client', 'service', 'user', 'payment'])
            ->whereDate('date', $date)
            ->orderBy('start_time')
            ->get()
            ->map(fn ($appt) => [
                'id' => $appt->id,
                'date' => $appt->date->toDateString(),
                'start' => substr($appt->getRawOriginal('start_time'), 0, 5), // "HH:MM"
                'client_id' => $appt->client_id,
                'client' => $appt->client?->name,
                'service' => $appt->service?->title,
                'duration' => $appt->service?->getRawOriginal('duration'), // "HH:MM:SS"
                'value' => (float) $appt->service?->value,
                'user' => $appt->user?->name,
                'paid' => $appt->payment_id !== null,
                'payment_method' => $appt->payment?->method,
            ]);

        return response()->json(['appointments' => $appointments]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'client_id' => 'required|exists:clients,id',
            'service_id' => 'required|exists:services,id',
            'user_id' => 'required|exists:users,id',
        ]);

        // Verificação de conflito realizada também no servidor
        $conflict = $this->hasConflict(
            $data['user_id'],
            $data['date'],
            $data['start_time'],
            $data['service_id'],
        );

        if ($conflict) {
            return response()->json(['message' => 'Conflito de horário com outro agendamento deste profissional.'], 422);
        }

        $appointment = Appointment::create($data);

        /* TODO: encontrar uma api de mensagem no whatsapp por um preço bom
        Funcionalidade 'desativada' por enquanto até
        
        $appointmentDateTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $data['date'].' '.$data['start_time'],
            config('app.timezone')
        );

        $runAt = $appointmentDateTime->copy()->subDay();

        if ($runAt->isFuture()) {
            SendAppointmentReminderJob::dispatch($appointment->id)
                ->delay($runAt->utc());
        }
        */

        return response()->json(['appointment' => $appointment->load(['client', 'service', 'user'])], 201);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json(['message' => 'Agendamento cancelado.']);
    }

    public function registerPayment(Request $request, Appointment $appointment): JsonResponse
    {
        if ($appointment->payment_id) {
            return response()->json(['message' => 'Este agendamento já possui pagamento registrado.'], 422);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'value' => 'required|numeric|min:0',
            'method' => 'required|string|max:50',
        ]);

        $payment = Payment::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'value' => $data['value'],
            'is_enter' => true,
            'user_id' => auth()->id(),
            'method' => $data['method'],
        ]);

        $appointment->update(['payment_id' => $payment->id]);

        return response()->json(['payment' => $payment], 201);
    }

    public function checkConflict(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'service_id' => 'required|exists:services,id',
            'exclude_id' => 'nullable|exists:appointments,id',
        ]);

        $conflict = $this->hasConflict(
            $request->user_id,
            $request->date,
            $request->start_time,
            $request->service_id,
            $request->exclude_id,
        );

        return response()->json(['conflict' => $conflict]);
    }

    /**
     * Verifica se um agendamento conflita com outro do mesmo profissional no mesmo dia.
     */
    private function hasConflict(
        int $userId,
        string $date,
        string $startTime,
        int $serviceId,
        ?int $excludeId = null,
    ): bool {
        $service = \App\Models\Service::find($serviceId);
        if (! $service) {
            return false;
        }

        [$dh, $dm] = explode(':', $service->getRawOriginal('duration'));
        $durationMins = (int) $dh * 60 + (int) $dm;

        [$sh, $sm] = explode(':', $startTime);
        $newStart = (int) $sh * 60 + (int) $sm;
        $newEnd = $newStart + $durationMins;

        $appointments = Appointment::with('service')
            ->where('user_id', $userId)
            ->whereDate('date', $date)
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->get();

        foreach ($appointments as $appt) {
            [$eh, $em] = explode(':', substr($appt->getRawOriginal('start_time'), 0, 5));
            $existStart = (int) $eh * 60 + (int) $em;

            $dur = $appt->service?->getRawOriginal('duration') ?? '01:00:00';
            [$edh, $edm] = explode(':', $dur);
            $existEnd = $existStart + (int) $edh * 60 + (int) $edm;

            // Sobreposição: novo começa antes de existente terminar E novo termina depois de existente começar
            if ($newStart < $existEnd && $newEnd > $existStart) {
                return true;
            }
        }

        return false;
    }
}
