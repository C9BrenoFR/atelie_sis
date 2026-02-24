<?php

namespace Database\Seeders;

use App\Models\Payment;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Popula a tabela de pagamentos com entradas e saídas.
     */
    public function run(): void
    {
        // Pagamentos de entrada (receitas de serviços)
        Payment::factory(40)->entrada()->create();

        // Pagamentos de saída (despesas operacionais)
        Payment::factory(10)->saida()->create();
    }
}
