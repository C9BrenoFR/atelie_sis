<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Lista de serviços de ateliê para dados mais realistas.
     */
    private array $services = [
        // Sobrancelhas
        ['title' => 'Design de Sobrancelha',           'description' => 'Modelagem e design de sobrancelhas com pinça e linha.',                  'duration' => '00:30:00', 'value' => 45.00],
        ['title' => 'Design de Sobrancelha com Henna', 'description' => 'Design de sobrancelhas com aplicação de henna para realçar o traço.',     'duration' => '00:45:00', 'value' => 65.00],
        ['title' => 'Laminação de Sobrancelha',        'description' => 'Técnica de alinhamento e fixação dos fios das sobrancelhas.',             'duration' => '01:00:00', 'value' => 90.00],

        // Depilação
        ['title' => 'Depilação com Cera',              'description' => 'Depilação corporal com cera quente ou fria.',                             'duration' => '01:00:00', 'value' => 80.00],
        ['title' => 'Depilação a Laser',               'description' => 'Depilação definitiva com laser de diodo.',                                'duration' => '01:30:00', 'value' => 250.00],

        // Massagem
        ['title' => 'Massagem Relaxante',              'description' => 'Massagem corporal com técnicas de relaxamento profundo.',                 'duration' => '01:00:00', 'value' => 130.00],
        ['title' => 'Massagem Modeladora',             'description' => 'Massagem com movimentos intensos para redução de medidas.',               'duration' => '01:00:00', 'value' => 150.00],
        ['title' => 'Drenagem Linfática',              'description' => 'Técnica manual para estimular o sistema linfático e reduzir inchaço.',    'duration' => '01:00:00', 'value' => 140.00],

        // Limpeza e Tratamentos Faciais
        ['title' => 'Limpeza de Pele',                 'description' => 'Limpeza profunda com extração de cravos e oleosidade.',                   'duration' => '01:30:00', 'value' => 120.00],
        ['title' => 'Peeling Químico',                 'description' => 'Esfoliação química para renovação celular e uniformização do tom da pele.', 'duration' => '01:00:00', 'value' => 180.00],
        ['title' => 'Microagulhamento',                'description' => 'Estímulo de colágeno por microcanais para rejuvenescimento facial.',      'duration' => '01:30:00', 'value' => 300.00],
        ['title' => 'Hidratação Facial',               'description' => 'Máscara e soro hidratante com ativos concentrados.',                      'duration' => '01:00:00', 'value' => 90.00],

        // Procedimentos Estéticos
        ['title' => 'Botox',                           'description' => 'Aplicação de toxina botulínica para suavização de rugas e linhas.',       'duration' => '00:45:00', 'value' => 800.00],
        ['title' => 'Preenchimento Labial',            'description' => 'Preenchimento com ácido hialurônico para volume e definição dos lábios.', 'duration' => '01:00:00', 'value' => 700.00],
        ['title' => 'Radiofrequência Facial',          'description' => 'Estímulo de colágeno com calor para lifting e firmeza da pele.',          'duration' => '01:00:00', 'value' => 200.00],

        // Unhas
        ['title' => 'Manicure',                        'description' => 'Cuidados completos para as unhas das mãos.',                              'duration' => '00:45:00', 'value' => 45.00],
        ['title' => 'Pedicure',                        'description' => 'Cuidados completos para as unhas dos pés.',                               'duration' => '01:00:00', 'value' => 55.00],
        ['title' => 'Alongamento de Unhas em Gel',     'description' => 'Extensão de unhas com gel para maior durabilidade e estética.',           'duration' => '02:00:00', 'value' => 160.00],
    ];

    /**
     * Define o estado padrão do model.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $service = fake()->randomElement($this->services);

        return [
            'title' => $service['title'],
            'description' => $service['description'],
            'duration' => $service['duration'],
            'value' => $service['value'],
        ];
    }
}
