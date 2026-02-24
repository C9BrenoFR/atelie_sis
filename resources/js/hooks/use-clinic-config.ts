import { usePage } from '@inertiajs/react';

/**
 * Retorna as configurações globais da clínica compartilhadas via Inertia.
 * Os valores são definidos em `App\Helpers\ClinicConfig` no backend.
 */
export function useClinicConfig() {
    const { clinic } = usePage().props;
    return clinic;
}
