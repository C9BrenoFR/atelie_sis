<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Payment;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define o estado padrão do model.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'date' => fake()->dateTimeBetween('-6 months', '+1 month')->format('Y-m-d'),
            'start' => fake()->time('H:i:s', '18:00:00'), // horário entre 00:00 e 18:00
            'client_id' => Client::factory(),
            'user_id' => User::factory(),
            'service_id' => Service::factory(),
            'payment_id' => null, // pagamento é opcional; use withPayment() para associar
        ];
    }

    /**
     * Estado que associa um pagamento ao agendamento.
     */
    public function withPayment(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_id' => Payment::factory(),
        ]);
    }
}
