import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Check, MessageCircle, Pencil, X } from 'lucide-react';
import { useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { index as clientsRoute } from '@/routes/clients';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Client } from '@/types/models';

interface Props {
    client: Client;
}

// ---------------------------------------------------------------------------
// Campo editável inline — clique duplo para editar
// ---------------------------------------------------------------------------
interface EditableFieldProps {
    label: string;
    value: string;
    type?: 'text' | 'date' | 'tel';
    onSave: (value: string) => void;
    format?: (value: string) => string;
    inputClass?: string;
}

function EditableField({ label, value, type = 'text', onSave, format, inputClass }: EditableFieldProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    function startEdit() {
        setDraft(value);
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    function cancel() {
        setDraft(value);
        setEditing(false);
    }

    function save() {
        if (draft.trim() === '' || draft === value) { cancel(); return; }
        onSave(draft);
        setEditing(false);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') cancel();
    }

    return (
        <div className="group relative flex flex-col gap-1 rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-border hover:bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>

            {editing ? (
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type={type}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            'flex-1 border-b border-primary bg-transparent text-sm text-foreground outline-none',
                            inputClass,
                        )}
                    />
                    <button
                        onClick={save}
                        className="flex h-6 w-6 items-center justify-center rounded text-emerald-500 hover:bg-emerald-500/10"
                    >
                        <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={cancel}
                        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between" onDoubleClick={startEdit}>
                    <span className="text-sm text-foreground">
                        {format ? format(value) : value}
                    </span>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
                </div>
            )}

            {!editing && (
                <p className="mt-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Clique duplo para editar
                </p>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Selectable field (para gênero)
// ---------------------------------------------------------------------------
const GENDER_OPTIONS = [
    { value: 'F', label: 'Feminino' },
    { value: 'M', label: 'Masculino' },
    { value: 'O', label: 'Outro' },
];

const GENDER_LABEL: Record<string, string> = { F: 'Feminino', M: 'Masculino', O: 'Outro' };
const GENDER_CLASS: Record<string, string> = {
    M: 'bg-blue-500/10 text-blue-500',
    F: 'bg-pink-500/10 text-pink-500',
    O: 'bg-muted text-muted-foreground',
};

interface EditableSelectProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onSave: (value: string) => void;
    badge?: boolean;
    badgeClass?: (v: string) => string;
    displayLabel?: (v: string) => string;
}

function EditableSelect({ label, value, options, onSave, badge, badgeClass, displayLabel }: EditableSelectProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    function save(v: string) {
        setDraft(v);
        setEditing(false);
        if (v !== value) onSave(v);
    }

    const shown = displayLabel ? displayLabel(value) : value;

    return (
        <div className="group relative flex flex-col gap-1 rounded-lg border border-transparent px-4 py-3 transition-colors hover:border-border hover:bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>

            {editing ? (
                <div className="flex flex-wrap gap-2 pt-1">
                    {options.map((o) => (
                        <button
                            key={o.value}
                            onClick={() => save(o.value)}
                            className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium ring-2 ring-transparent transition-all',
                                draft === o.value ? 'ring-primary' : 'bg-muted hover:bg-muted/70',
                                badge && badgeClass ? badgeClass(o.value) : '',
                            )}
                        >
                            {o.label}
                        </button>
                    ))}
                    <button onClick={() => setEditing(false)} className="ml-1 text-xs text-muted-foreground underline">
                        Cancelar
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between" onDoubleClick={() => { setDraft(value); setEditing(true); }}>
                    {badge ? (
                        <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', badgeClass?.(value))}>
                            {shown}
                        </span>
                    ) : (
                        <span className="text-sm text-foreground">{shown}</span>
                    )}
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
                </div>
            )}

            {!editing && (
                <p className="mt-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Clique duplo para editar
                </p>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Helpers de formato
// ---------------------------------------------------------------------------
function formatPhone(phone: string): string {
    const d = phone.replace(/\D/g, '');
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return phone;
}

function unformatPhone(phoneNumber: string): string {
    let phone = phoneNumber.replace(/\D/g, '');

    if (!phone.startsWith('55')) {
        phone = '55' + phone;
    }

    return phone;
}

function formatDate(value: string): string {
    if (!value) return '—';
    // pega só YYYY-MM-DD caso venha como ISO
    const iso = value.split('T')[0];
    const [y, m, d] = iso.split('-');
    const age = new Date().getFullYear() - Number(y);
    return `${d}/${m}/${y} (${age} anos)`;
}

function toInputDate(value: string): string {
    // garante formato YYYY-MM-DD para o input[type=date]
    return value ? value.split('T')[0] : '';
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------
export default function ClientDetail({ client }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard().url },
        { title: 'Clientes', href: clientsRoute().url },
        { title: client.name, href: '#' },
    ];

    function patch(field: keyof Client, value: string) {
        router.put(`/clients/${client.id}`, { [field]: value }, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={client.name} />

            <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
                {/* Cabeçalho */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.visit(clientsRoute().url)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className='flex gap-2 justify-center items-center'>
                        <h1 className="text-xl font-semibold">{client.name}</h1>
                        <a
                            target='_blank'
                            href={`https://wa.me/${unformatPhone(client.phone)}`}
                            className='transition-all flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:scale-110 hover:text-green-500'
                        >
                            <MessageCircle className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                {/* Card de dados */}
                <div className="rounded-xl border border-border">
                    <div className="border-b border-border px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Dados pessoais
                        </p>
                    </div>

                    <div className="divide-y divide-border">
                        <EditableField
                            label="Nome completo"
                            value={client.name}
                            onSave={(v) => patch('name', v)}
                        />
                        <EditableField
                            label="Telefone"
                            value={client.phone}
                            type="tel"
                            format={formatPhone}
                            onSave={(v) => patch('phone', v)}
                        />
                        <EditableSelect
                            label="Gênero"
                            value={client.gender}
                            options={GENDER_OPTIONS}
                            badge
                            badgeClass={(v) => GENDER_CLASS[v] ?? 'bg-muted text-muted-foreground'}
                            displayLabel={(v) => GENDER_LABEL[v] ?? v}
                            onSave={(v) => patch('gender', v)}
                        />
                        <EditableField
                            label="Data de nascimento"
                            value={toInputDate(client.birth_date)}
                            type="date"
                            format={formatDate}
                            onSave={(v) => patch('birth_date', v)}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
