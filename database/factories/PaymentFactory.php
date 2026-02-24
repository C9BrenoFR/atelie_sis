<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Métodos de pagamento disponíveis.
     */
    private array $methods = ['pix', 'dinheiro', 'cartao_credito', 'cartao_debito'];

    /**
     * Define o estado padrão do model.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $isEnter = fake()->boolean(80); // 80% de chance de ser entrada

        return [
            'title' => $isEnter ? 'Pagamento de serviço' : 'Despesa operacional',
            'description' => fake()->optional(0.6)->sentence(),
            'value' => fake()->randomFloat(2, 30, 500),
            'is_enter' => $isEnter,
            'method' => fake()->randomElement($this->methods),
        ];
    }

    /**
     * Estado para pagamentos de entrada (receitas).
     */
    public function entrada(): static
    {
        return $this->state(fn (array $attributes) => [
            'title' => 'Pagamento de serviço',
            'is_enter' => true,
        ]);
    }

    /**
     * Estado para pagamentos de saída (despesas).
     */
    public function saida(): static
    {
        return $this->state(fn (array $attributes) => [
            'title' => 'Despesa operacional',
            'is_enter' => false,
        ]);
    }
}
