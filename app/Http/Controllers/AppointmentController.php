<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', now()->toDateString());

        $appointments = Appointment::with(['client', 'service', 'user', 'payment'])
            ->whereDate('date', $date)
            ->orderBy('start_time')
            ->get()
            ->map(fn ($appt) => [
                'id'             => $appt->id,
                'date'           => $appt->date->toDateString(),
                'start'          => substr($appt->getRawOriginal('start_time'), 0, 5), // "HH:MM"
                'client'         => $appt->client?->name,
                'service'        => $appt->service?->title,
                'duration'       => $appt->service?->getRawOriginal('duration'), // "HH:MM:SS"
                'value'          => (float) $appt->service?->value,
                'user'           => $appt->user?->name,
                'paid'           => $appt->payment_id !== null,
                'payment_method' => $appt->payment?->method,
            ]);

        return response()->json([
            'appointments' => $appointments,
        ]);
    }
}

