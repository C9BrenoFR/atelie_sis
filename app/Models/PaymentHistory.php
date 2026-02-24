<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentHistory extends Model
{
    public $timestamps = false;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var list<string>
     */
    protected $fillable = [
        'payment_id',
        'title',
        'description',
        'value',
        'is_enter',
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
            'value'    => 'decimal:2',
            'is_enter' => 'boolean',
        ];
    }

    // -------------------------------------------------------------------------
    // Relacionamentos
    // -------------------------------------------------------------------------

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
