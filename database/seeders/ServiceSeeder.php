<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Popula a tabela de serviços.
     */
    public function run(): void
    {
        Service::factory(19)->create();
    }
}
