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
        Service::insert([
            [
                'title' => 'Avaliação',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 0.00
            ],
            [
                'title' => 'Botox',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 900.00
            ],
            [
                'title' => 'Carbox',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 50.00
            ],
            [
                'title' => 'Cone Chines',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 50.00
            ],
            [
                'title' => 'Criolipolise',
                'description' => 'n/a',
                'duration' => '01:30:00',
                'value' => 0.00
            ],
            [
                'title' => 'Depilação',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 0.00
            ],
            [
                'title' => 'Dermo Pump',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 0.00
            ],
            [
                'title' => 'Designer com Henna',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 35.00
            ],
            [
                'title' => 'Designer Simples',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 30.00
            ],
            [
                'title' => 'Diástase Zero',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 30.00
            ],
            [
                'title' => 'DLM',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 100.00
            ],
            [
                'title' => 'Drenagem Limfática',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 100.00
            ],
            [
                'title' => 'Heccus',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 100.00
            ],
            [
                'title' => 'Hidratação Rose de Mer',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 300.00
            ],
            [
                'title' => 'Hidrolipo',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 150.00
            ],
            [
                'title' => 'Limpeza de Pele',
                'description' => 'n/a',
                'duration' => '02:00:00',
                'value' => 120.00
            ],
            [
                'title' => 'Lipo Enzimatica',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 120.00
            ],
            [
                'title' => 'Manta',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 00.00
            ],
            [
                'title' => 'Micropigmentação',
                'description' => 'n/a',
                'duration' => '02:00:00',
                'value' => 400.00
            ],
            [
                'title' => 'PEIM',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 150.00
            ],
            [
                'title' => 'Rádio Frequência Corporal',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 90.00
            ],
            [
                'title' => 'Rádio Frequência Fácial',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 90.00
            ],
            [
                'title' => 'Retoque Micropigmentação',
                'description' => 'n/a',
                'duration' => '01:30:00',
                'value' => 220.00
            ],
            [
                'title' => 'Retorno',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 00.00
            ],
            [
                'title' => 'Skin Booster',
                'description' => 'n/a',
                'duration' => '01:00:00',
                'value' => 300.00
            ],
            [
                'title' => 'Depilação Sombrancelha & Buço',
                'description' => 'n/a',
                'duration' => '00:30:00',
                'value' => 50.00
            ],
        ]);
    }
}
