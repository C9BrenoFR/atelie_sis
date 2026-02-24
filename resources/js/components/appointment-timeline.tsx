import { Banknote, Calendar, Clock, CreditCard, User2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/appointment';

// ---------------------------------------------------------------------------
// Constante de layout — px por hora na linha do tempo
// ---------------------------------------------------------------------------
const ROW_HEIGHT = 80;

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

const METHODS_PT: Record<string, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
};

function parseStartMinutes(start: string): number {
    const [h, m] = start.split(':').map(Number);
    return h * 60 + m;
}

function parseDurationMinutes(duration: string): number {
    const [h, m] = duration.split(':').map(Number);
    return h * 60 + m;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDuration(duration: string): string {
    const [h, m] = duration.split(':').map(Number);
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${String(m).padStart(2, '0')}`;
}

function getCurrentMinutes(): number {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
}

function buildHours(openHour: number, closeHour: number): number[] {
    return Array.from({ length: closeHour - openHour + 1 }, (_, i) => openHour + i);
}

// ---------------------------------------------------------------------------
// Skeleton — mantém a silhueta da linha do tempo durante o carregamento
// ---------------------------------------------------------------------------

interface SkeletonProps {
    openHour: number;
    closeHour: number;
}

export function TimelineSkeleton({ openHour, closeHour }: SkeletonProps) {
    const hours = buildHours(openHour, closeHour);
    const totalHours = closeHour - openHour;

    // Posições fictícias de cards para preencher o skeleton
    const fakePlacements = [
        { offsetMins: 60, durationMins: 60 },
        { offsetMins: 150, durationMins: 45 },
        { offsetMins: 270, durationMins: 90 },
        { offsetMins: 420, durationMins: 60 },
    ];

    return (
        <div className="relative animate-pulse" style={{ height: totalHours * ROW_HEIGHT }}>
            {hours.map((hour, i) => (
                <div key={hour} className="absolute left-0 right-0 flex" style={{ top: i * ROW_HEIGHT }}>
                    <div className="w-14 shrink-0 -translate-y-2.5 pr-3 text-right">
                        <Skeleton className="ml-auto h-2.5 w-9" />
                    </div>
                    <div className="flex-1 border-t border-border/40" />
                </div>
            ))}

            {fakePlacements.map((fp, i) => {
                const top = (fp.offsetMins / 60) * ROW_HEIGHT;
                const height = Math.max((fp.durationMins / 60) * ROW_HEIGHT - 4, 36);
                return (
                    <div
                        key={i}
                        className="absolute left-16 right-2 rounded-xl border bg-muted"
                        style={{ top: top + 2, height }}
                    />
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Linha do tempo principal
// ---------------------------------------------------------------------------

interface AppointmentTimelineProps {
    appointments: Appointment[];
    openHour: number;
    closeHour: number;
    isToday: boolean;
}

export function AppointmentTimeline({
    appointments,
    openHour,
    closeHour,
    isToday,
}: AppointmentTimelineProps) {
    const hours = buildHours(openHour, closeHour);
    const totalHours = closeHour - openHour;

    const [currentMinutes, setCurrentMinutes] = useState(getCurrentMinutes);
    const currentTimeRef = useRef<HTMLDivElement>(null);

    // Atualiza o marcador de hora atual a cada minuto
    useEffect(() => {
        const id = setInterval(() => setCurrentMinutes(getCurrentMinutes()), 60_000);
        return () => clearInterval(id);
    }, []);

    // Rola automaticamente até a hora atual ao ver o dia de hoje
    useEffect(() => {
        if (isToday && currentTimeRef.current) {
            currentTimeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isToday]);

    const showCurrentTime =
        isToday && currentMinutes >= openHour * 60 && currentMinutes <= closeHour * 60;

    const currentTop = ((currentMinutes - openHour * 60) / 60) * ROW_HEIGHT;

    return (
        <div className="relative" style={{ height: totalHours * ROW_HEIGHT }}>
            {/* ── Grade de horas ─────────────────────────────────────────── */}
            {hours.map((hour, i) => (
                <div key={hour} className="absolute left-0 right-0 flex" style={{ top: i * ROW_HEIGHT }}>
                    {/* Rótulo de hora */}
                    <div className="w-14 shrink-0 -translate-y-2.5 pr-3 text-right">
                        <span className="text-[11px] font-medium tabular-nums text-muted-foreground/60">
                            {String(hour).padStart(2, '0')}:00
                        </span>
                    </div>
                    {/* Linha horizontal */}
                    <div className="flex-1 border-t border-border/40" />
                </div>
            ))}

            {/* ── Marcador de hora atual ──────────────────────────────────── */}
            {showCurrentTime && (
                <div
                    ref={currentTimeRef}
                    className="pointer-events-none absolute left-14 right-0 z-20 flex items-center"
                    style={{ top: currentTop }}
                >
                    <div className="h-2 w-2 -translate-x-1 rounded-full bg-red-500 shadow" />
                    <div className="h-[1.5px] flex-1 bg-red-500/75" />
                </div>
            )}

            {/* ── Cards de agendamento ────────────────────────────────────── */}
            {appointments.length === 0 ? (
                /* Estado vazio: mantém a grade visível com aviso centralizado */
                <div
                    className="absolute left-16 right-0 flex flex-col items-center justify-center gap-2 text-center"
                    style={{ top: ROW_HEIGHT * 2, height: ROW_HEIGHT * 4 }}
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Calendar className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Nenhum agendamento</p>
                    <p className="text-xs text-muted-foreground/60">
                        {isToday ? 'Agenda livre hoje.' : 'Sem agendamentos neste dia.'}
                    </p>
                </div>
            ) : (
                appointments.map((appt) => {
                    const startMins = parseStartMinutes(appt.start);
                    const durationMins = parseDurationMinutes(appt.duration ?? '01:00:00');

                    // Ignora agendamentos fora do horário de funcionamento
                    if (startMins < openHour * 60 || startMins >= closeHour * 60) return null;

                    const top = ((startMins - openHour * 60) / 60) * ROW_HEIGHT;
                    const height = Math.max((durationMins / 60) * ROW_HEIGHT - 4, 40);

                    return (
                        <div
                            key={appt.id}
                            className={cn(
                                'absolute left-16 right-2 overflow-hidden rounded-xl border border-l-4 bg-card px-3 py-2 shadow-sm transition-shadow hover:shadow-md',
                                appt.paid ? 'border-l-emerald-500' : 'border-l-amber-400',
                            )}
                            style={{ top: top + 2, height }}
                        >
                            {/* Linha principal: serviço + badge */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold leading-snug">
                                        {appt.service ?? '—'}
                                    </p>
                                    <p className="truncate text-[11px] text-muted-foreground">
                                        {appt.client ?? '—'}
                                    </p>
                                </div>

                                {height >= 54 && (
                                    <Badge
                                        variant={appt.paid ? 'default' : 'outline'}
                                        className={cn(
                                            'h-4 shrink-0 px-1.5 text-[10px]',
                                            !appt.paid &&
                                            'border-amber-400 text-amber-600 dark:text-amber-400',
                                        )}
                                    >
                                        {appt.paid ? '✓ Pago' : 'Pendente'}
                                    </Badge>
                                )}
                            </div>

                            {/* Linha de detalhes — só aparece quando há espaço */}
                            {height >= 68 && (
                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" />
                                        {appt.duration ? formatDuration(appt.duration) : '—'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User2 className="h-2.5 w-2.5" />
                                        {appt.user ?? '—'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Banknote className="h-2.5 w-2.5" />
                                        {appt.value != null ? formatCurrency(appt.value) : '—'}
                                    </span>
                                    {appt.paid && appt.payment_method && (
                                        <span className="flex items-center gap-1">
                                            <CreditCard className="h-2.5 w-2.5" />
                                            {METHODS_PT[appt.payment_method] ?? appt.payment_method}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
