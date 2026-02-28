<?php

use Illuminate\Support\Facades\Http;

if (! function_exists('sendMessage')) {
    function sendMessage($phone, $message)
    {
        Http::withHeaders([
            'Client-Token' => config('services.whatsapp.token'),
        ])->post(
            config('services.whatsapp.url'),
            [
                'phone' => $phone,
                'message' => $message,
            ]
        );
    }
}
