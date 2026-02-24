<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $payments = [];

        if ($user->is_admin) {
            $payments = Payment::with('payment_histories')
                ->latest()
                ->get();
        } else {
            $payments = Payment::with('payment_histories')
                ->where('user_id', $user->id)
                ->latest()
                ->get();
        }

        return Inertia::render('payments', [
            'payments' => $payments,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'value' => 'required|numeric|min:0',
            'is_enter' => 'required|boolean',
            'method' => 'nullable|string|max:100',
        ]);

        $data['user_id'] = auth()->id();

        Payment::create($data);

        return back();
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        abort_if($payment->user_id !== auth()->id(), 403);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:1000',
            'value' => 'sometimes|numeric|min:0',
            'is_enter' => 'sometimes|boolean',
            'method' => 'sometimes|nullable|string|max:100',
        ]);

        // Guarda um snapshot dos dados antigos no histórico
        $payment->payment_histories()->create([
            'title' => $payment->title,
            'description' => $payment->description,
            'value' => $payment->value,
            'is_enter' => $payment->is_enter,
            'method' => $payment->method,
        ]);

        $payment->update($data);

        return back();
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        abort_if($payment->user_id !== auth()->id(), 403);

        $payment->delete();

        return to_route('payments.index');
    }
}
