import { router, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ClipboardCopy, Loader2, Pencil, Plus, Trash2, TriangleAlert, Users } from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, User } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Funcionários', href: '#' },
];

interface UsersProps {
    users: User[];
}

interface CreatedUser {
    name: string;
    email: string;
    password: string;
}

type PageProps = {
    flash: { createdUser?: CreatedUser };
};

const ITEMS_PER_PAGE = 10;

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ---------------------------------------------------------------------------
// Modal de Credenciais (exibido após criar funcionário)
// ---------------------------------------------------------------------------
function CredentialsModal({ user, onClose }: { user: CreatedUser | null; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        if (!user) return;
        const text = `Nome: ${user.name}\nEmail: ${user.email}\nSenha temporária: ${user.password}`;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    }

    return (
        <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Funcionário criado!</DialogTitle>
                    <DialogDescription>
                        Salve as credenciais abaixo — a senha temporária não será exibida novamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4">
                    <div className="grid gap-0.5">
                        <span className="text-xs text-muted-foreground">Nome</span>
                        <span className="text-sm font-medium text-foreground">{user?.name}</span>
                    </div>
                    <div className="grid gap-0.5">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <span className="text-sm font-medium text-foreground">{user?.email}</span>
                    </div>
                    <div className="grid gap-0.5">
                        <span className="text-xs text-muted-foreground">Senha temporária</span>
                        <span className="font-mono text-base font-bold tracking-widest text-foreground">
                            {user?.password}
                        </span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                    <Button onClick={handleCopy}>
                        <ClipboardCopy className="h-4 w-4" />
                        {copied ? 'Copiado!' : 'Copiar tudo'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Modal de Criar / Editar
// ---------------------------------------------------------------------------
interface UserFormState {
    name: string;
    email: string;
    is_admin: boolean;
    salary: string;
}

const EMPTY_FORM: UserFormState = { name: '', email: '', is_admin: false, salary: '' };

function UserFormModal({
    open,
    initial,
    onClose,
    onSubmit,
    saving,
    errors,
}: {
    open: boolean;
    initial: UserFormState;
    onClose: () => void;
    onSubmit: (form: UserFormState) => void;
    saving: boolean;
    errors: Partial<Record<keyof UserFormState, string>>;
}) {
    const [form, setForm] = useState<UserFormState>(initial);

    useEffect(() => { if (open) setForm(initial); }, [open, initial]);

    function set<K extends keyof UserFormState>(field: K, value: UserFormState[K]) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    const isEdit = !!initial.name;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar funcionário' : 'Novo funcionário'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Altere os dados do funcionário abaixo.'
                            : 'Preencha os dados para cadastrar um novo funcionário. Uma senha temporária será gerada automaticamente.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
                    className="grid gap-4 py-2"
                >
                    {/* Nome */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="uf-name">Nome</Label>
                        <Input
                            id="uf-name"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="Ex: Ana Silva"
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="uf-email">Email</Label>
                        <Input
                            id="uf-email"
                            type="email"
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            placeholder="Ex: ana.silva@exemplo.com"
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    {/* Salário */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="uf-salary">Salário (R$)</Label>
                        <Input
                            id="uf-salary"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.salary}
                            onChange={(e) => set('salary', e.target.value)}
                            placeholder="0,00"
                        />
                        {errors.salary && <p className="text-xs text-destructive">{errors.salary}</p>}
                    </div>

                    {/* Administrador — toggle estilizado */}
                    <div className="grid gap-1.5">
                        <Label>Administrador?</Label>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.is_admin}
                            onClick={() => set('is_admin', !form.is_admin)}
                            className={cn(
                                'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors',
                                form.is_admin
                                    ? 'border-primary/40 bg-primary/10 text-primary'
                                    : 'border-border text-muted-foreground hover:bg-muted/50',
                            )}
                        >
                            {/* pill toggle */}
                            <span
                                className={cn(
                                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors',
                                    form.is_admin ? 'bg-primary' : 'bg-input',
                                )}
                            >
                                <span
                                    className={cn(
                                        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform',
                                        form.is_admin ? 'translate-x-4' : 'translate-x-0',
                                    )}
                                />
                            </span>
                            {form.is_admin ? 'Sim — acesso de administrador' : 'Não — acesso padrão'}
                        </button>
                        {errors.is_admin && <p className="text-xs text-destructive">{errors.is_admin}</p>}
                    </div>

                    <DialogFooter className="mt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="animate-spin" />}
                            {isEdit ? 'Salvar alterações' : 'Cadastrar funcionário'}
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
function DeleteUserModal({ user, onClose }: { user: User | null; onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleDelete() {
        if (!user) return;
        setLoading(true);
        setError(null);
        router.delete(`/users/${user.id}`, {
            preserveScroll: true,
            onError: () => { setError('Não foi possível excluir. Tente novamente.'); setLoading(false); },
            onFinish: () => {setLoading(false); onClose()},
        });
    }

    return (
        <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TriangleAlert className="h-5 w-5 text-destructive" />
                        Excluir funcionário
                    </DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir{' '}
                        <span className="font-semibold text-foreground">{user?.name}</span>?
                        Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading && <Loader2 className="animate-spin" />}
                        Excluir funcionário
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------
export default function UsersPage({ users: allUsers }: UsersProps) {
    const { flash } = usePage<PageProps>().props;

    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormState, string>>>({});

    // Exibe o modal de credenciais quando a flash chega após criar
    useEffect(() => {
        if (flash?.createdUser) setCreatedUser(flash.createdUser);
    }, [flash?.createdUser]);

    const totalPages = Math.max(1, Math.ceil(allUsers.length / ITEMS_PER_PAGE));
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const users = allUsers.slice(offset, offset + ITEMS_PER_PAGE);
    const goTo = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));

    function openCreate() {
        setEditTarget(null);
        setFormErrors({});
        setFormOpen(true);
    }

    function openEdit(user: User) {
        setEditTarget(user);
        setFormErrors({});
        setFormOpen(true);
    }

    function handleSubmit(form: UserFormState) {
        setSaving(true);
        setFormErrors({});

        const payload = {
            name: form.name,
            email: form.email,
            is_admin: form.is_admin,
            salary: parseFloat(form.salary) || 0,
        };

        if (editTarget) {
            router.put(`/users/${editTarget.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { setFormOpen(false); setSaving(false); },
                onError: (errs) => { setFormErrors(errs as Partial<Record<keyof UserFormState, string>>); setSaving(false); },
                onFinish: () => setSaving(false),
            });
        } else {
            router.post('/users', payload, {
                preserveScroll: true,
                onSuccess: () => { setFormOpen(false); setSaving(false); },
                onError: (errs) => { setFormErrors(errs as Partial<Record<keyof UserFormState, string>>); setSaving(false); },
                onFinish: () => setSaving(false),
            });
        }
    }

    const formInitial: UserFormState = editTarget
        ? {
            name: editTarget.name,
            email: editTarget.email,
            is_admin: editTarget.is_admin,
            salary: String(editTarget.salary),
        }
        : EMPTY_FORM;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Funcionários" />

            <CredentialsModal user={createdUser} onClose={() => setCreatedUser(null)} />
            <UserFormModal
                open={formOpen}
                initial={formInitial}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmit}
                saving={saving}
                errors={formErrors}
            />
            <DeleteUserModal user={deleteTarget} onClose={() => setDeleteTarget(null)} />

            <div className="flex h-fit flex-col gap-4 overflow-hidden p-4">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <h1 className="text-lg font-semibold">Funcionários</h1>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {allUsers.length}
                        </span>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Novo funcionário
                    </button>
                </div>

                {/* Tabela */}
                <div className="flex-1 overflow-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Nome</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Admin</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Salário</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                        Nenhum funcionário encontrado.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, i) => (
                                    <tr
                                        key={user.id}
                                        className={cn(
                                            'border-b border-border transition-colors last:border-0 hover:bg-muted/30',
                                            i % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                                        )}
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                                        <td className="max-w-xs px-4 py-3 text-muted-foreground">
                                            <span className="line-clamp-1">{user.email}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                                    user.is_admin
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-muted text-muted-foreground',
                                                )}
                                            >
                                                {user.is_admin ? 'Admin' : 'Padrão'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {formatCurrency(user.salary)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    title="Editar funcionário"
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(user)}
                                                    title="Excluir funcionário"
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
                            {offset + 1}–{Math.min(offset + ITEMS_PER_PAGE, allUsers.length)} de {allUsers.length}
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
