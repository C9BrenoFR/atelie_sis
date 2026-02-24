<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'description',
        'value',
        'is_enter',
        'user_id',
        'method',
    ];

    /**
     * Conversão de tipos dos atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'is_enter' => 'boolean', // true = entrada, false = saída
        ];
    }

    // -------------------------------------------------------------------------
    // Relacionamentos
    // -------------------------------------------------------------------------

    /**
     * Retorna o histórico de modificações deste pagamento.
     */
    public function payment_histories(): HasMany
    {
        return $this->hasMany(PaymentHistory::class)->latest('created_at');
    }

    /**
     * Retorna o agendamento vinculado a este pagamento (se existir).
     */
    public function appointment(): HasOne
    {
        return $this->hasOne(Appointment::class);
    }
}
