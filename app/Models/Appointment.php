<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var list<string>
     */
    protected $fillable = [
        'date',
        'start_time',
        'payment_id',
        'client_id',
        'user_id',
        'service_id',
    ];

    /**
     * Conversão de tipos dos atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'start_time' => 'immutable_datetime', // cast de time para manipulação via Carbon
        ];
    }

    // -------------------------------------------------------------------------
    // Relacionamentos
    // -------------------------------------------------------------------------

    /**
     * Retorna o colaborador (usuário) responsável pelo agendamento.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Retorna o cliente vinculado a este agendamento.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Retorna o serviço associado a este agendamento.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Retorna o pagamento vinculado a este agendamento (opcional).
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
