import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus, Settings, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { CreateClientModal } from '@/components/create-client-modal';
import { DeleteClientModal } from '@/components/delete-client-modal';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { show as clientShow } from '@/routes/clients';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Client } from '@/types/models';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Clientes', href: '#' },
];

interface ClientsProps {
    clients: Client[];
}

const ITEMS_PER_PAGE = 10;

const GENDER_LABEL: Record<string, string> = {
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
    M: 'Masculino',
    F: 'Feminino',
};

const GENDER_CLASS: Record<string, string> = {
    male: 'bg-blue-500/10 text-blue-500',
    female: 'bg-pink-500/10 text-pink-500',
    M: 'bg-blue-500/10 text-blue-500',
    F: 'bg-pink-500/10 text-pink-500',
};

function formatDate(value: string): string {
    // Suporta "YYYY-MM-DD" e "YYYY-MM-DDTHH:mm:ss.000000Z"
    const date = new Date(value);
    const today = new Date();
    return `${date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} - ${today.getFullYear() - date.getFullYear()} Anos`;
}

function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
}

export default function Clients({ clients: allClients }: ClientsProps) {
    const [page, setPage] = useState(1);
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

    const totalPages = Math.max(1, Math.ceil(allClients.length / ITEMS_PER_PAGE));
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const clients = allClients.slice(offset, offset + ITEMS_PER_PAGE);

    const goTo = (p: number) => setPage(Math.min(totalPages, Math.max(1, p)));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />

            <CreateClientModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <DeleteClientModal client={deleteTarget} onClose={() => setDeleteTarget(null)} />

            <div className="flex h-fit flex-col gap-4 overflow-hidden p-4">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <h1 className="text-lg font-semibold">Clientes</h1>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {allClients.length}
                        </span>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Novo cliente
                    </button>
                </div>

                {/* Tabela */}
                <div className="flex-1 overflow-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40">
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Nome</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Telefone</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Gênero</th>
                                <th className="px-4 py-3 text-left font-semibold text-foreground">Nascimento</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client, i) => (
                                    <tr
                                        key={client.id}
                                        className={cn(
                                            'border-b border-border transition-colors last:border-0 hover:bg-muted/30',
                                            i % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                                        )}
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">{client.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{formatPhone(client.phone)}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                    GENDER_CLASS[client.gender] ?? 'bg-muted text-muted-foreground',
                                                )}
                                            >
                                                {GENDER_LABEL[client.gender] ?? client.gender}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {client.birth_date ? formatDate(client.birth_date) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => router.visit(clientShow(client.id).url)}
                                                    title="Ver / editar cliente"
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                >
                                                    <Settings className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(client)}
                                                    title="Excluir cliente"
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
                            {offset + 1}–{Math.min(offset + ITEMS_PER_PAGE, allClients.length)} de {allClients.length}
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
                                        <span key={`ellipsis-${idx}`} className="px-1">
                                            …
                                        </span>
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

