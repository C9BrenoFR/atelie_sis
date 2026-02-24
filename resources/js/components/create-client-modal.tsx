import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface FormState {
    name: string;
    phone: string;
    gender: string;
    birth_date: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
}

const EMPTY: FormState = { name: '', phone: '', gender: '', birth_date: '' };

export function CreateClientModal({ open, onClose }: Props) {
    const [form, setForm] = useState<FormState>(EMPTY);
    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(EMPTY);
            setErrors({});
        }
    }, [open]);

    function set(field: keyof FormState, value: string) {
        setForm((f) => ({ ...f, [field]: value }));
        setErrors((e) => ({ ...e, [field]: undefined }));
    }

    function validate(): boolean {
        const e: Partial<FormState> = {};
        if (!form.name.trim()) e.name = 'Nome obrigatório.';
        if (!form.phone.trim()) e.phone = 'Telefone obrigatório.';
        if (!form.gender) e.gender = 'Gênero obrigatório.';
        if (!form.birth_date) e.birth_date = 'Data de nascimento obrigatória.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        router.post('/clients', { ...form }, {
            preserveScroll: true,
            onSuccess: () => { onClose(); setSaving(false); },
            onError: (errs) => { setErrors(errs as Partial<FormState>); setSaving(false); },
            onFinish: () => setSaving(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Novo Cliente</DialogTitle>
                    <DialogDescription>Preencha os dados para cadastrar um novo cliente.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-2">
                    {/* Nome */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="cc-name">Nome completo</Label>
                        <Input
                            id="cc-name"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="Ex: Maria Silva"
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    {/* Telefone */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="cc-phone">Telefone</Label>
                        <Input
                            id="cc-phone"
                            value={form.phone}
                            onChange={(e) => set('phone', e.target.value)}
                            placeholder="(00) 00000-0000"
                        />
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                    </div>

                    {/* Gênero + Nascimento */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label>Gênero</Label>
                            <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="F">Feminino</SelectItem>
                                    <SelectItem value="M">Masculino</SelectItem>
                                    <SelectItem value="O">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="cc-birth">Nascimento</Label>
                            <Input
                                id="cc-birth"
                                type="date"
                                value={form.birth_date}
                                onChange={(e) => set('birth_date', e.target.value)}
                            />
                            {errors.birth_date && <p className="text-xs text-destructive">{errors.birth_date}</p>}
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="animate-spin" />}
                            Cadastrar cliente
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
