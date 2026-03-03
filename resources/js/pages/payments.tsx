import { router, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft, ChevronRight, History, Loader2, Pencil, Plus, Trash2, Wallet, TriangleAlert } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Payment, PaymentHistory } from '@/types/models';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Pagamentos', href: '#' },
];

interface PaymentsProps {
    payments: Payment[];
}

const ITEMS_PER_PAGE = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const METHOD_LABELS: Record<string, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    credito: 'Crédito',
    debito: 'Débito',
    transferencia: 'Transferência',
};

const methods: string[] = [
    'Pix',
    'Dinheiro',
    'Débito',
    'Crédito',
    'Outro'
]

// ---------------------------------------------------------------------------
// Modal de Criar / Editar
// ---------------------------------------------------------------------------
interface PaymentFormState {
    title: string;
    description: string;
    value: string;
    is_enter: boolean;
    method: string;
}

const EMPTY_FORM: PaymentFormState = {
    title: '',
    description: '',
    value: '',
    is_enter: true,
    method: '',
};

function PaymentFormModal({
    open,
    initial,
    onClose,
    onSubmit,
    saving,
    errors,
}: {
    open: boolean;
    initial: PaymentFormState;
    onClose: () => void;
    onSubmit: (form: PaymentFormState) => void;
    saving: boolean;
    errors: Partial<Record<keyof PaymentFormState, string>>;
}) {
    const [form, setForm] = useState<PaymentFormState>(initial);

    useEffect(() => { if (open) setForm(initial); }, [open, initial]);

    function set<K extends keyof PaymentFormState>(field: K, value: PaymentFormState[K]) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    const isEdit = !!initial.title;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar pagamento' : 'Novo pagamento'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Altere os dados. A versão anterior ficará salva no histórico.'
                            : 'Preencha os dados para registrar um pagamento.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
                    className="grid gap-4 py-2"
                >
                    {/* Título */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="pf-title">Título</Label>
                        <Input
                            id="pf-title"
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            placeholder="Ex: Pagamento de serviço"
                        />
                        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                    </div>

                    {/* Descrição */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="pf-desc">
                            Descrição <span className="text-muted-foreground">(opcional)</span>
                        </Label>
                        <Input
                            id="pf-desc"
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            placeholder="Ex: Referente ao mês de fevereiro"
                        />
                        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>

                    {/* Valor + Tipo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="pf-value">Valor (R$)</Label>
                            <Input
                                id="pf-value"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.value}
                                onChange={(e) => set('value', e.target.value)}
                                placeholder="0,00"
                            />
                            {errors.value && <p className="text-xs text-destructive">{errors.value}</p>}
                        </div>

                        <div className="grid gap-1.5">
                            <Label>Tipo</Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => set('is_enter', true)}
                                    className={cn(
                                        'flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                                        form.is_enter
                                            ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                                            : 'border-border text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    <ArrowUpCircle className="h-3.5 w-3.5" />
                                    Entrada
                                </button>
                                <button
                                    type="button"
                                    onClick={() => set('is_enter', false)}
                                    className={cn(
                                        'flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                                        !form.is_enter
                                            ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                                            : 'border-border text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    <ArrowDownCircle className="h-3.5 w-3.5" />
                                    Saída
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Método */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="pf-method">
                            Método <span className="text-muted-foreground">(opcional)</span>
                        </Label>
                        <Select value={form.method} onValueChange={(v) => set('method', v)}>
                            <SelectTrigger aria-invalid={!!errors.method}>
                                <SelectValue placeholder="Selecione um método" />
                            </SelectTrigger>
                            <SelectContent>
                                {methods.map((m, index) => (
                                    <SelectItem key={index} value={m}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.method && <p className="text-xs text-destructive">{errors.method}</p>}
                    </div>

                    <DialogFooter className="mt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="animate-spin" />}
                            {isEdit ? 'Salvar alterações' : 'Registrar pagamento'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Modal de Histórico
// ---------------------------------------------------------------------------
function HistoryModal({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
    const histories = payment?.payment_histories ?? [];

    return (
        <Dialog open={!!payment} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        Histórico — {payment?.title}
                    </DialogTitle>
                    <DialogDescription>
                        Versões anteriores deste pagamento, da mais recente para a mais antiga.
                    </DialogDescription>
                </DialogHeader>

                {histories.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        Nenhuma alteração registrada ainda.
                    </p>
                ) : (
                    <ol className="max-h-96 overflow-y-auto divide-y divide-border">
                        {histories.map((h) => (
                            <li key={h.id} className="py-3 first:pt-0 last:pb-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium text-foreground">{h.title}</span>
                                        {h.description && (
                                            <span className="text-xs text-muted-foreground">{h.description}</span>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {h.method ? h.method : '—'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                                        <span
                                            className={cn(
                                                'text-sm font-semibold',
                                                h.is_enter ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                                            )}
                                        >
                                            {h.is_enter ? '+' : '−'} {formatCurrency(h.value)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{formatDate(h.created_at)}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Modal de Excluir
// ---------------------------------------------------------------------------
function DeletePaymentModal({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleDelete() {
        if (!payment) return;
        setLoading(true);
        setError(null);
        router.delete(`/payments/${payment.id}`, {
            preserveScroll: true,
            onError: () => { setError('Não foi possível excluir. Tente novamente.'); setLoading(false); },
            onFinish: () => { setLoading(false); onClose();},
        });
    }

    return (
        <Dialog open={!!payment} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TriangleAlert className="h-5 w-5 text-destructive" />
                        Excluir pagamento
                    </DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir{' '}
                        <span className="font-semibold text-foreground">{payment?.title}</span>?
                        Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading && <Loader2 className="animate-spin" />}
                        Excluir pagamento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------
export default function Payments({ payments: allPayments }: PaymentsProps) {
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Payment | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
    const [historyTarget, setHistoryTarget] = useState<Payment | null>(null);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof PaymentFormState, string>>>({});
    const { auth } = usePage().props;
    const user = auth.user

    const totalPages = Math.max(1, Math.ceil(allPayments.length / ITEMS_PER_PAGE));
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const payments = allPayments.slice(offset, offset + ITEMS_PER_PAGE);
    const goTo = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));

    function openCreate() {
        setEditTarget(null);
        setFormErrors({});
        setFormOpen(true);
    }

    function openEdit(payment: Payment) {
        setEditTarget(payment);
        setFormErrors({});
        setFormOpen(true);
    }

    function handleSubmit(form: PaymentFormState) {
        setSaving(true);
        setFormErrors({});

        const payload = {
            ...form,
            value: Number(form.value),
            method: form.method || null,
        };

        if (editTarget) {
            router.put(`/payments/${editTarget.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { setFormOpen(false); setSaving(false); },
                onError: (errs) => { setFormErrors(errs as Partial<Record<keyof PaymentFormState, string>>); setSaving(false); },
                onFinish: () => setSaving(false),
            });
        } else {
            router.post('/payments', payload, {
                preserveScroll: true,
                onSuccess: () => { setFormOpen(false); setSaving(false); },
                onError: (errs) => { setFormErrors(errs as Partial<Record<keyof PaymentFormState, string>>); setSaving(false); },
                onFinish: () => setSaving(false),
            });
        }
    }

    const formInitial: PaymentFormState = editTarget
        ? {
            title: editTarget.title,
            description: editTarget.description ?? '',
            value: String(editTarget.value),
            is_enter: editTarget.is_enter,
            method: editTarget.method ?? '',
        }
        : EMPTY_FORM;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pagamentos" />

            <PaymentFormModal
                open={formOpen}
                initial={formInitial}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmit}
                saving={saving}
                errors={formErrors}
            />
            <HistoryModal payment={historyTarget} onClose={() => setHistoryTarget(null)} />
            <DeletePaymentModal payment={deleteTarget} onClose={() => setDeleteTarget(null)} />

            <div className="flex h-fit flex-col gap-4 overflow-hidden p-4">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-muted-foreground" />
                        <h1 className="text-lg font-semibold">Pagamentos</h1>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {allPayments.length}
                        </span>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Novo pagamento
                    </button>
                </div>

                {/* Tabela */}
                <div className="flex-1 overflow-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Tipo</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Título</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Descrição</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Método</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Valor</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                        Nenhum pagamento encontrado.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment, i) => (
                                    <tr
                                        key={payment.id}
                                        className={cn(
                                            'border-b border-border transition-colors last:border-0 hover:bg-muted/30',
                                            i % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                                        )}
                                    >
                                        <td className="px-4 py-3">
                                            {payment.is_enter ? (
                                                <ArrowUpCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <ArrowDownCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-foreground">{payment.title}</td>
                                        <td className="max-w-xs px-4 py-3 text-muted-foreground">
                                            <span className="line-clamp-1">{payment.description || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {payment.method ?  payment.method : '—'}
                                        </td>
                                        <td className={cn(
                                            'px-4 py-3 font-medium',
                                            payment.is_enter ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                                        )}>
                                            {payment.is_enter ? '+' : '−'} {formatCurrency(payment.value)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {user.is_admin && (
                                                    <button
                                                        onClick={() => setHistoryTarget(payment)}
                                                        title="Ver histórico"
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                    >
                                                        <History className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEdit(payment)}
                                                    title="Editar pagamento"
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(payment)}
                                                    title="Excluir pagamento"
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            {offset + 1}–{Math.min(offset + ITEMS_PER_PAGE, allPayments.length)} de {allPayments.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => goTo(page - 1)}
                                disabled={page === 1}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-1">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => goTo(p as number)}
                                            className={cn(
                                                'flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors',
                                                page === p
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border hover:bg-muted',
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ),
                                )}

                            <button
                                onClick={() => goTo(page + 1)}
                                disabled={page === totalPages}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-border transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
