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
    public function __construct(public int $appointment_id) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {

        $appointment = Appointment::find($this->appointment_id);

        if(!$appointment)
            return;

        logger()->info('[APPOINTMENT JOB INITIATE]', [
            'appointment_id' => $appointment->id,
        ]);

        /*
        -- Variaveis do template --
        1. Nome do Cliente
        2. Tipo de atendimento
        3. Data (Formato dd/mm/YY)
        4. Horário
        */

        $message_template = "Olá %s tudo bem? \nPassando aqui para confirmar seu atendimento de *%s* no dia *%s* ás *%s* horas. \nContamos com sua presença!";

        $message = sprintf(
            $message_template,
            $appointment->client->name,
            $appointment->service->title,
            $appointment->date->format('d/m/Y'),
            $appointment->start_time->format('H:i')
        );

            $phone = unformatPhoneNumber($appointment->client->phone);

            sendMessage($phone, $message);
        
        logger()->info('[APPOINTMENT JOB DONE]', [
            'appointment_id' => $appointment->id,
        ]);
    }

    /**
     * Execute when the job fail.
     */
    public function failed(\Throwable $exception)
    {
        logger()->error('[APPOINTMENT JOB ERROR]: ',[
            'appointment_id' => $this->appointment_id,
            'error' => $exception->getMessage(),
        ]);
    }
}
