import { usePage } from '@inertiajs/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { Input } from '@/components/ui/input';
import { TimeInput } from '@/components/ui/time-input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------
interface ServiceOption {
    id: number;
    title: string;
    duration: string; // "HH:MM:SS"
    value: number;
}

interface SelectOption {
    id: number;
    name: string;
}

interface FormState {
    date: string;
    start_time: string;
    client_id: string;
    service_id: string;
    user_id: string;
}

interface Props {
    open: boolean;
    defaultDate: string; // "YYYY-MM-DD"
    onClose: () => void;
    onCreated: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatLocalDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addMinutesToTime(time: string, mins: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + mins;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function parseDurationMins(duration: string): number {
    const [h, m] = duration.split(':').map(Number);
    return h * 60 + m;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export function CreateAppointmentModal({ open, defaultDate, onClose, onCreated }: Props) {
    const { clientOptions: clients, serviceOptions: services, userOptions: users } = usePage().props as unknown as {
        clientOptions: SelectOption[];
        serviceOptions: ServiceOption[];
        userOptions: SelectOption[];
    };

    const [form, setForm] = useState<FormState>({
        date: defaultDate,
        start_time: '08:00',
        client_id: '',
        service_id: '',
        user_id: '',
    });

    const [conflictWarning, setConflictWarning] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    // Sincroniza a data padrão ao abrir o modal
    useEffect(() => {
        if (open) {
            setForm((f) => ({ ...f, date: defaultDate }));
            setConflictWarning(null);
            setErrors({});
        }
    }, [open, defaultDate]);

    const selectedService = services.find((s) => String(s.id) === form.service_id);

    // Verifica conflito ao mudar user, data, hora ou serviço
    useEffect(() => {
        if (!form.user_id || !form.service_id || !form.start_time || !form.date) {
            setConflictWarning(null);
            return;
        }

        const controller = new AbortController();
        setChecking(true);

        const params = new URLSearchParams({
            user_id: form.user_id,
            date: form.date,
            start_time: form.start_time,
            service_id: form.service_id,
        });

        fetch(`/api/appointments/check-conflict?${params}`, { signal: controller.signal })
            .then((r) => r.json())
            .then((data) => {
                if (data.conflict) {
                    const service = services.find((s) => String(s.id) === form.service_id);
                    const endTime = service
                        ? addMinutesToTime(form.start_time, parseDurationMins(service.duration))
                        : '?';
                    setConflictWarning(
                        `Este profissional já tem um agendamento que conflita com ${form.start_time}–${endTime}.`,
                    );
                } else {
                    setConflictWarning(null);
                }
            })
            .catch(() => { })
            .finally(() => setChecking(false));

        return () => controller.abort();
    }, [form.user_id, form.service_id, form.start_time, form.date, services]);

    function set(field: keyof FormState, value: string) {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: undefined }));
    }

    function validate(): boolean {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!form.date) e.date = 'Data obrigatória.';
        if (!form.start_time) e.start_time = 'Hora obrigatória.';
        if (!form.client_id) e.client_id = 'Selecione um cliente.';
        if (!form.service_id) e.service_id = 'Selecione um serviço.';
        if (!form.user_id) e.user_id = 'Selecione um profissional.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate() || conflictWarning) return;

        setSaving(true);
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                if (data.message) setConflictWarning(data.message);
                return;
            }

            onCreated();
            onClose();
            setForm({ date: defaultDate, start_time: '08:00', client_id: '', service_id: '', user_id: '' });
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                    <DialogDescription>Preencha os dados para criar um agendamento.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-2">
                    {/* Data + Hora */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="ca-date">Data</Label>
                            <Input
                                id="ca-date"
                                type="date"
                                value={form.date}
                                onChange={(e) => set('date', e.target.value)}
                                aria-invalid={!!errors.date}
                            />
                            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="ca-time">Hora</Label>
                            <div lang="en-GB">
                                <TimeInput
                                    id="ca-time"
                                    value={form.start_time}
                                    onChange={(v) => set('start_time', v)}
                                    aria-invalid={!!errors.start_time}
                                />
                            </div>
                            {errors.start_time && (
                                <p className="text-xs text-destructive">{errors.start_time}</p>
                            )}
                        </div>
                    </div>

                    {/* Cliente */}
                    <div className="grid gap-1.5">
                        <Label>Cliente</Label>
                        <Select value={form.client_id} onValueChange={(v) => set('client_id', v)}>
                            <SelectTrigger aria-invalid={!!errors.client_id}>
                                <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.client_id && (
                            <p className="text-xs text-destructive">{errors.client_id}</p>
                        )}
                    </div>

                    {/* Serviço */}
                    <div className="grid gap-1.5">
                        <Label>Serviço</Label>
                        <Select value={form.service_id} onValueChange={(v) => set('service_id', v)}>
                            <SelectTrigger aria-invalid={!!errors.service_id}>
                                <SelectValue placeholder="Selecione um serviço" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedService && (
                            <p className="text-[11px] text-muted-foreground">
                                Duração: {selectedService.duration.slice(0, 5)} &bull; Valor:{' '}
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                }).format(selectedService.value)}
                            </p>
                        )}
                        {errors.service_id && (
                            <p className="text-xs text-destructive">{errors.service_id}</p>
                        )}
                    </div>

                    {/* Profissional */}
                    <div className="grid gap-1.5">
                        <Label>Profissional</Label>
                        <Select value={form.user_id} onValueChange={(v) => set('user_id', v)}>
                            <SelectTrigger aria-invalid={!!errors.user_id}>
                                <SelectValue placeholder="Selecione um profissional" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={String(u.id)}>
                                        {u.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.user_id && (
                            <p className="text-xs text-destructive">{errors.user_id}</p>
                        )}
                    </div>

                    {/* Aviso de conflito */}
                    {(conflictWarning || checking) && (
                        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{checking ? 'Verificando conflitos…' : conflictWarning}</span>
                        </div>
                    )}

                    <DialogFooter className="mt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving || !!conflictWarning || checking}>
                            {saving && <Loader2 className="animate-spin" />}
                            Criar agendamento
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
