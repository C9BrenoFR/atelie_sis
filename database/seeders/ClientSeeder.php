<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Popula a tabela de clientes.
     */
    public function run(): void
    {
        Client::factory(30)->create();
    }
}
