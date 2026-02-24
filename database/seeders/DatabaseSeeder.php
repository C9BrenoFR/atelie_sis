<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,       // 1. Usuários (colaboradores)
            ClientSeeder::class,     // 2. Clientes
            ServiceSeeder::class,    // 3. Serviços
            PaymentSeeder::class,    // 4. Pagamentos avulsos (sem agendamento)
            AppointmentSeeder::class,// 5. Agendamentos (referenciam tudo acima)
        ]);
    }
}
