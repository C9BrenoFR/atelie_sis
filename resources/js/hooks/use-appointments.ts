import { useCallback, useRef, useState } from 'react';
import type { Appointment } from '@/types/appointment';

export function useAppointments() {
    // Cada chave é uma data "YYYY-MM-DD" e o valor é a lista de agendamentos já buscados.
    // Os dados permanecem em cache durante toda a sessão da página.
    const cache = useRef<Record<string, Appointment[]>>({});

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDay = useCallback(async (date: string) => {
        // Se já temos dados para este dia, retorna imediatamente sem loading
        if (cache.current[date] !== undefined) {
            setAppointments(cache.current[date]);
            return;
        }

        setLoading(true);
        setError(null);
        setAppointments([]);

        try {
            const res = await fetch(`/api/appointments?date=${date}`);
            if (!res.ok) throw new Error('Erro ao buscar agendamentos');
            const data = await res.json();
            cache.current[date] = data.appointments ?? [];
            setAppointments(cache.current[date]);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }, []);

    /** Remove a data do cache, forçando uma nova requisição na próxima visita. */
    const invalidate = useCallback((date: string) => {
        delete cache.current[date];
    }, []);

    return { appointments, loading, error, fetchDay, invalidate };
}
