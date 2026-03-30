import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Clipboard, Loader2, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

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
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Service } from '@/types/models';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Serviços', href: '#' },
];

interface ServicesProps {
    services: Service[];
}

const ITEMS_PER_PAGE = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDuration(duration: string): string {
    const [h, m] = duration.split(':').map(Number);
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${String(m).padStart(2, '0')}`;
}

// Converte "01:30:00" → "01:30" para o input[type=time]
function toInputTime(duration: string): string {
    return duration ? duration.slice(0, 5) : '';
}

function resolveServicePhoto(photo: string): string {
    if (!photo) return '/storage/default.jpg';
    if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('/') || photo.startsWith('blob:')) {
        return photo;
    }
    return `/storage/${photo}`;
}

// ---------------------------------------------------------------------------
// Modal de Criar
// ---------------------------------------------------------------------------
interface ServiceFormState {
    title: string;
    description: string;
    duration: string; // HH:MM
    value: string;
    photo: File | null;
}

interface ServiceFormErrors {
    title?: string;
    description?: string;
    duration?: string;
    value?: string;
    photo?: string;
}

const EMPTY_FORM: ServiceFormState = { title: '', description: '', duration: '01:00', value: '', photo: null };

function ServiceFormModal({
    open,
    initial,
    initialPhotoUrl,
    onClose,
    onSubmit,
    saving,
    errors,
}: {
    open: boolean;
    initial: ServiceFormState;
    initialPhotoUrl?: string | null;
    onClose: () => void;
    onSubmit: (form: ServiceFormState) => void;
    saving: boolean;
    errors: ServiceFormErrors;
}) {
    const [form, setForm] = useState<ServiceFormState>(initial);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhotoUrl ?? null);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (!open) return;

        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        setForm(initial);
        setPreviewUrl(initialPhotoUrl ?? null);
    }, [open, initial, initialPhotoUrl]);

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    function set(field: Exclude<keyof ServiceFormState, 'photo'>, value: string) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;

        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        setForm((f) => ({ ...f, photo: file }));

        if (!file) {
            setPreviewUrl(initialPhotoUrl ?? null);
            return;
        }

        const url = URL.createObjectURL(file);
        objectUrlRef.current = url;
        setPreviewUrl(url);
    }

    const isEdit = !!initial.title;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar serviço' : 'Novo serviço'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Altere os dados do serviço abaixo.' : 'Preencha os dados para cadastrar um novo serviço.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
                    className="grid gap-4 py-2"
                >
                    {/* Título */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="sf-title">Título</Label>
                        <Input
                            id="sf-title"
                            value={form.title}
                            onChange={(e) => set('title', e.target.value)}
                            placeholder="Ex: Design de Sobrancelha"
                        />
                        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                    </div>

                    {/* Descrição */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="sf-desc">Descrição <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input
                            id="sf-desc"
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            placeholder="Ex: Modelagem e design completo"
                        />
                        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="sf-photo">Imagem</Label>
                        <Input
                            id="sf-photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                        <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Pré-visualização da imagem do serviço"
                                    className="h-40 w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
                                    Nenhuma imagem selecionada
                                </div>
                            )}
                        </div>
                        {errors.photo && <p className="text-xs text-destructive">{errors.photo}</p>}
                    </div>

                    {/* Duração + Valor */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="sf-duration">Duração</Label>
                            <div lang="en-GB">
                                <TimeInput
                                    id="sf-duration"
                                    value={form.duration}
                                    onChange={(v) => set('duration', v)}
                                />
                            </div>
                            {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="sf-value">Valor (R$)</Label>
                            <Input
                                id="sf-value"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.value}
                                onChange={(e) => set('value', e.target.value)}
                                placeholder="0,00"
                            />
                            {errors.value && <p className="text-xs text-destructive">{errors.value}</p>}
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="animate-spin" />}
                            {isEdit ? 'Salvar alterações' : 'Cadastrar serviço'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Modal de Excluir
// ---------------------------------------------------------------------------
function DeleteServiceModal({ service, onClose }: { service: Service | null; onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleDelete() {
        if (!service) return;
        setLoading(true);
        setError(null);
        router.delete(`/services/${service.id}`, {
            preserveScroll: true,
            onError: () => { setError('Não foi possível excluir. Tente novamente.'); setLoading(false); },
            onFinish: () => setLoading(false),
        });
    }

    return (
        <Dialog open={!!service} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TriangleAlert className="h-5 w-5 text-destructive" />
                        Excluir serviço
                    </DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir{' '}
                        <span className="font-semibold text-foreground">{service?.title}</span>?
                        Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading && <Loader2 className="animate-spin" />}
                        Excluir serviço
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------
export default function Services({ services: allServices }: ServicesProps) {
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Service | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<ServiceFormErrors>({});

    const totalPages = Math.max(1, Math.ceil(allServices.length / ITEMS_PER_PAGE));
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const services = allServices.slice(offset, offset + ITEMS_PER_PAGE);
    const goTo = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));

    function openCreate() {
        setEditTarget(null);
        setFormErrors({});
        setFormOpen(true);
    }

    function openEdit(service: Service) {
        setEditTarget(service);
        setFormErrors({});
        setFormOpen(true);
    }

    function handleSubmit(form: ServiceFormState) {
        setSaving(true);
        setFormErrors({});

        const payload: Record<string, string | number | File> = {
            title: form.title,
            description: form.description,
            duration: form.duration,
            value: Number(form.value),
        };

        if (form.photo) {
            payload.photo = form.photo;
        }

        if (editTarget) {
            router.put(`/services/${editTarget.id}`, payload, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => { setFormOpen(false); setSaving(false); },
                onError: (errs) => { setFormErrors(errs as ServiceFormErrors); setSaving(false); },
                onFinish: () => setSaving(false),
            });
        } else {
            router.post('/services', payload, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => { setFormOpen(false); setSaving(false); },
                onError: (errs) => { setFormErrors(errs as ServiceFormErrors); setSaving(false); },
                onFinish: () => setSaving(false),
            });
        }
    }

    const formInitial: ServiceFormState = editTarget
        ? {
            title: editTarget.title,
            description: editTarget.description ?? '',
            duration: toInputTime(editTarget.duration),
            value: String(editTarget.value),
                photo: null,
        }
        : EMPTY_FORM;

            const editPhotoUrl = editTarget ? resolveServicePhoto(editTarget.photo) : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Serviços" />

            <ServiceFormModal
                open={formOpen}
                initial={formInitial}
                initialPhotoUrl={editPhotoUrl}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmit}
                saving={saving}
                errors={formErrors}
            />
            <DeleteServiceModal service={deleteTarget} onClose={() => setDeleteTarget(null)} />

            <div className="flex h-fit flex-col gap-4 overflow-hidden p-4">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clipboard className="h-5 w-5 text-muted-foreground" />
                        <h1 className="text-lg font-semibold">Serviços</h1>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {allServices.length}
                        </span>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Novo serviço
                    </button>
                </div>

                {/* Tabela */}
                <div className="flex-1 overflow-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Título</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Descrição</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Duração</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Valor</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                        Nenhum serviço encontrado.
                                    </td>
                                </tr>
                            ) : (
                                services.map((service, i) => (
                                    <tr
                                        key={service.id}
                                        className={cn(
                                            'border-b border-border transition-colors last:border-0 hover:bg-muted/30',
                                            i % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                                        )}
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">{service.title}</td>
                                        <td className="max-w-xs px-4 py-3 text-muted-foreground">
                                            <span className="line-clamp-1">{service.description || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatDuration(service.duration)}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {formatCurrency(service.value)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(service)}
                                                    title="Editar serviço"
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(service)}
                                                    title="Excluir serviço"
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
                            {offset + 1}–{Math.min(offset + ITEMS_PER_PAGE, allServices.length)} de {allServices.length}
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
