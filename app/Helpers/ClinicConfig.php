<?php

namespace App\Helpers;

/**
 * Configurações globais da clínica.
 *
 * Para alterar o horário de funcionamento, basta mudar as constantes abaixo.
 */
class ClinicConfig
{
    /** Hora de abertura da clínica (formato 24h, hora cheia). */
    public const int OPEN_HOUR = 8;

    /** Hora de fechamento da clínica (formato 24h, hora cheia). */
    public const int CLOSE_HOUR = 20;

    /**
     * Retorna a configuração como array para compartilhamento via Inertia.
     *
     * @return array<string, int>
     */
    public static function toArray(): array
    {
        return [
            'open_hour' => self::OPEN_HOUR,
            'close_hour' => self::CLOSE_HOUR,
        ];
    }

    public static function paymentMethods(): array
    {
        return ['Pix', 'Dinheiro', 'Crédito', 'Débito'];
    }
}
