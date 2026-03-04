import { Loader2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Appointment } from '@/types/appointment';

const methods: string[] = [
    'Pix',
    'Dinheiro',
    'Débito',
    'Crédito',
    'Outro'
]
interface Props {
    appointment: Appointment | null;
    onClose: () => void;
    onPaid: (id: number) => void;
}

export function RegisterPaymentModal({ appointment, onClose, onPaid }: Props) {
    const defaultTitle = appointment ? `${appointment.service} - ${appointment.client?.name}` : '';

    const [title, setTitle] = useState(defaultTitle);
    const [description, setDescription] = useState('');
    const [value, setValue] = useState(String(appointment?.value ?? ''));
    const [method, setMethod] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Atualiza os campos padrão sempre que o agendamento mudar
    useEffect(() => {
        if (appointment) {
            setTitle(`${appointment.service} - ${appointment.client?.name}`);
            setValue(String(appointment.value ?? ''));
            setDescription('');
            setMethod('');
            setErrors({});
        }
    }, [appointment]);

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!title.trim()) e.title = 'Título obrigatório.';
        if (!value || Number(value) < 0) e.value = 'Valor inválido.';
        if (!method) e.method = 'Selecione um método.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!appointment || !validate()) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/appointments/${appointment.id}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ title, description, value: Number(value), method }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrors({ form: data.message ?? 'Erro ao registrar pagamento.' });
                return;
            }

            onPaid(appointment.id);
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={!!appointment} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Pagamento</DialogTitle>
                    <DialogDescription>
                        Confirme os dados do pagamento para este atendimento.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-2">
                    {/* Título */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="rp-title">Título</Label>
                        <Input
                            id="rp-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            aria-invalid={!!errors.title}
                        />
                        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                    </div>

                    {/* Descrição */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="rp-desc">
                            Descrição{' '}
                            <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                        </Label>
                        <Input
                            id="rp-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Observações sobre o pagamento"
                        />
                    </div>

                    {/* Valor + Método */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="rp-value">Valor (R$)</Label>
                            <Input
                                id="rp-value"
                                type="number"
                                min="0"
                                step="0.01"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                aria-invalid={!!errors.value}
                            />
                            {errors.value && (
                                <p className="text-xs text-destructive">{errors.value}</p>
                            )}
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Método</Label>
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger aria-invalid={!!errors.method}>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {methods.map((m, index) => (
                                                                        <SelectItem key={index} value={m}>
                                                                            {m}
                                                                        </SelectItem>
                                                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.method && (
                                <p className="text-xs text-destructive">{errors.method}</p>
                            )}
                        </div>
                    </div>

                    {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}

                    <DialogFooter className="mt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="animate-spin" />}
                            Confirmar pagamento
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
