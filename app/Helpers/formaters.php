<?php

if (! function_exists('unformatPhoneNumber')) {
    function unformatPhoneNumber($phone_number)
    {
        $phone = preg_replace('/\D/', '', $phone_number);

        if (! str_starts_with($phone, '55')) {
            $phone = '55'.$phone;
        }

        return $phone;
    }
}
