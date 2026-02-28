<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Payment;
use App\Models\User;
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

        $employee_count = User::where('is_admin', false)->count();
        $clients_count = Client::count();

        $appointments_count = Appointment::whereBetween('created_at', [
            $startOfMonth,
            $endOfMonth,
        ])->count();

        $payments = Payment::whereBetween('created_at', [
            $startOfMonth,
            $endOfMonth,
        ])->get();

        return Inertia::render('data_analysis', [
            'employees' => $employee_count,
            'clients' => $clients_count,
            'appointments' => $appointments_count,
            'payments' => $payments,
            'month' => $startOfMonth->format('d/m/Y'),
        ]);
    }
}
