<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DataController extends Controller
{
    public function index(Request $request)
    {
        $monthParam = $request->query('month');

        if ($monthParam) {
            $date = Carbon::createFromFormat('Y-m', $monthParam);
        } else {
            $date = now();
        }

        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();

        $appointments_count = Appointment::whereBetween('date', [
            $startOfMonth,
            $endOfMonth,
        ])->count();

        $appointments_not_paid = Appointment::whereBetween('date', [
            $startOfMonth,
            $endOfMonth,
        ])
            ->whereNull('payment_id')
            ->get();

        $month_not_paid = 0;

        foreach ($appointments_not_paid as $appointment) {
            $month_not_paid += $appointment->service->value;
        }

        $payments = Payment::whereBetween('created_at', [
            $startOfMonth,
            $endOfMonth,
        ])->get();

        return Inertia::render('data_analysis', [
            'appointments_count' => $appointments_count,
            'appointments_not_paid' => $appointments_not_paid->count(),
            'month_not_paid' => $month_not_paid,
            'payments' => $payments,
            'month' => $startOfMonth->format('d/m/Y'),
        ]);
    }
}
