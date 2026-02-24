import { Loader2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { getCsrfToken } from '@/lib/csrf';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Appointment } from '@/types/appointment';

interface Props {
    appointment: Appointment | null;
    onClose: () => void;
    onDeleted: (id: number) => void;
}

export function DeleteAppointmentModal({ appointment, onClose, onDeleted }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete() {
        if (!appointment) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/appointments/${appointment.id}`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!res.ok) throw new Error('Erro ao cancelar agendamento.');

            onDeleted(appointment.id);
            onClose();
        } catch {
            setError('Não foi possível cancelar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={!!appointment} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TriangleAlert className="h-5 w-5 text-destructive" />
                        Cancelar agendamento
                    </DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja cancelar o agendamento de{' '}
                        <span className="font-semibold text-foreground">
                            {appointment?.service ?? '—'}
                        </span>{' '}
                        para{' '}
                        <span className="font-semibold text-foreground">
                            {appointment?.client ?? '—'}
                        </span>
                        ? Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Voltar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading && <Loader2 className="animate-spin" />}
                        Cancelar agendamento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
