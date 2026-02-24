<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class AppointmentSeeder extends Seeder
{
    /**
     * Popula a tabela de agendamentos reaproveitando registros existentes.
     */
    public function run(): void
    {
        // Reutiliza registros já existentes no banco
        $userIds = User::pluck('id');
        $clientIds = Client::pluck('id');
        $serviceIds = Service::pluck('id');

        // Agendamentos sem pagamento vinculado (pendentes)
        Appointment::factory(20)
            ->state(fn () => [
                'user_id' => $userIds->random(),
                'client_id' => $clientIds->random(),
                'service_id' => $serviceIds->random(),
            ])
            ->create();

        // Agendamentos com pagamento vinculado (concluídos)
        Appointment::factory(30)
            ->withPayment()
            ->state(fn () => [
                'user_id' => $userIds->random(),
                'client_id' => $clientIds->random(),
                'service_id' => $serviceIds->random(),
            ])
            ->create();
    }
}
