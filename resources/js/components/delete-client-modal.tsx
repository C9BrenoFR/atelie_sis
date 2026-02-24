import { router } from '@inertiajs/react';
import { Loader2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Client } from '@/types/models';

interface Props {
    client: Client | null;
    onClose: () => void;
}

export function DeleteClientModal({ client, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleDelete() {
        if (!client) return;
        setLoading(true);
        setError(null);
        router.delete(`/clients/${client.id}`, {
            preserveScroll: true,
            onError: () => { setError('Não foi possível excluir. Tente novamente.'); setLoading(false); },
            onFinish: () => setLoading(false),
        });
    }

    return (
        <Dialog open={!!client} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TriangleAlert className="h-5 w-5 text-destructive" />
                        Excluir cliente
                    </DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir{' '}
                        <span className="font-semibold text-foreground">{client?.name}</span>? Esta ação não pode ser desfeita e todos os agendamentos relacionados serão afetados.
                    </DialogDescription>
                </DialogHeader>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading && <Loader2 className="animate-spin" />}
                        Excluir cliente
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
