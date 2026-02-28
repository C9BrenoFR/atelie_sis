<?php

namespace App\Jobs;

use App\Models\Appointment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendAppointmentReminderJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Appointment $appointment) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        logger()->info('Lembrete enviado para appointment: '.$this->appointment->id);

        /*
        -- Variaveis do template --
        1. Nome do Cliente
        2. Tipo de atendimento
        3. Data (Formato dd/mm/YY)
        4. Horário

        $message_template = "Olá %s tudo certo? \nPassando aqui para confirmar seu atendimento de %s no dia %s ás %s horas. \nContamos com sua presença!";

        $message = sprintf(
            $message_template,
            $this->appointment->client->name,
            $this->appointment->service->title,
            $this->appointment->date,
            $this->appointment->start_time
            );

            $phone = unformatPhoneNumber($this->appointment->client->phone);

            sendMessage($phone, $message);
        */
    }
}
