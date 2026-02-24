import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AppointmentTimeline, TimelineSkeleton } from '@/components/appointment-timeline';
import { CreateAppointmentModal } from '@/components/create-appointment-modal';
import { MiniCalendar } from '@/components/mini-calendar';
import { useAppointments } from '@/hooks/use-appointments';
import { useClinicConfig } from '@/hooks/use-clinic-config';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

// ---------------------------------------------------------------------------
// Utilitários de data
// ---------------------------------------------------------------------------

function formatLocalDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr: string, n: number): string {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return formatLocalDate(d);
}

function formatDateLabel(dateStr: string): string {
    const label = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(dateStr + 'T12:00:00'));
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ---------------------------------------------------------------------------
// Dashboard principal
// ---------------------------------------------------------------------------

export default function Dashboard() {
    const today = formatLocalDate(new Date());
    const [selectedDate, setSelectedDate] = useState(today);
    const { appointments, loading, error, fetchDay, invalidate } = useAppointments();
    const { open_hour: openHour, close_hour: closeHour } = useClinicConfig();
    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        void fetchDay(selectedDate);
    }, [selectedDate, fetchDay]);

    const paidCount = appointments.filter((a) => a.paid).length;
    const totalRevenue = appointments
        .filter((a) => a.paid)
        .reduce((sum, a) => sum + (a.value ?? 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full gap-5 overflow-hidden p-4">
                {/* ── Painel esquerdo ───────────────────────────────────── */}
                <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto">
                    <MiniCalendar selected={selectedDate} onSelect={setSelectedDate} />

                    {/* Resumo do dia */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Resumo do dia
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total</span>
                                <span className="text-sm font-semibold">
                                    {loading ? '…' : appointments.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Pagos</span>
                                <span className="text-sm font-semibold text-emerald-600">
                                    {loading ? '…' : paidCount}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Pendentes</span>
                                <span className="text-sm font-semibold text-amber-500">
                                    {loading ? '…' : appointments.length - paidCount}
                                </span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Receita confirmada</span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        {loading ? '…' : formatCurrency(totalRevenue)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Área principal ────────────────────────────────────── */}
                <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
                    {/* Cabeçalho com navegação de dias */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                            className="rounded-lg border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label="Dia anterior"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <h2 className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight">
                            {formatDateLabel(selectedDate)}
                        </h2>

                        <button
                            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                            className="rounded-lg border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label="Próximo dia"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>

                        {selectedDate !== today && (
                            <button
                                onClick={() => setSelectedDate(today)}
                                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                            >
                                Hoje
                            </button>
                        )}

                        <button
                            onClick={() => setCreateOpen(true)}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            Agendar
                        </button>
                    </div>

                    {/* Legenda */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-1 rounded-full bg-emerald-500" />
                            Pago
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-1 rounded-full bg-amber-400" />
                            Pendente
                        </span>
                        {selectedDate === today && (
                            <span className="flex items-center gap-1.5">
                                <span className="h-0.5 w-4 bg-red-500" />
                                Hora atual
                            </span>
                        )}
                    </div>

                    {/* Linha do tempo */}
                    <div className="flex-1 overflow-y-auto pr-1">
                        {error ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <p className="text-sm text-destructive">{error}</p>
                                <button
                                    onClick={() => void fetchDay(selectedDate)}
                                    className="mt-2 text-sm underline"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        ) : loading ? (
                            <TimelineSkeleton openHour={openHour} closeHour={closeHour} />
                        ) : (
                            <AppointmentTimeline
                                appointments={appointments}
                                openHour={openHour}
                                closeHour={closeHour}
                                isToday={selectedDate === today}
                                onDeleted={() => { invalidate(selectedDate); void fetchDay(selectedDate); }}
                                onPaid={() => { invalidate(selectedDate); void fetchDay(selectedDate); }}
                            />
                        )}
                    </div>
                </main>
            </div>

            <CreateAppointmentModal
                open={createOpen}
                defaultDate={selectedDate}
                onClose={() => setCreateOpen(false)}
                onCreated={() => { invalidate(selectedDate); void fetchDay(selectedDate); }}
            />
        </AppLayout>
    );
}

