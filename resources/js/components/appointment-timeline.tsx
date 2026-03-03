import { Link } from '@inertiajs/react';
import { Banknote, Clock, CreditCard, MessageCircle, Trash2, User2, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { DeleteAppointmentModal } from '@/components/delete-appointment-modal';
import { RegisterPaymentModal } from '@/components/register-payment-modal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { unformatPhone } from '@/lib/formaters';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types/appointment';

// ---------------------------------------------------------------------------
// Constante de layout — px por hora na linha do tempo
// ---------------------------------------------------------------------------
const ROW_HEIGHT = 110;

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

function generateWhatsAppText(appt: Appointment){
    const message = `Olá ${appt.client?.name} tudo certo?\nPassando aqui para confirmar seu atendimento de ${appt.service} no dia ${appt.date} ás ${appt.start} horas.\nContamos com sua presença!`
    
    return encodeURIComponent(message);
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
    onDeleted: (id: number) => void;
    onPaid: (id: number) => void;
}

export function AppointmentTimeline({
    appointments,
    openHour,
    closeHour,
    isToday,
    onDeleted,
    onPaid,
}: AppointmentTimelineProps) {
    const hours = buildHours(openHour, closeHour);
    const totalHours = closeHour - openHour;

    const [currentMinutes, setCurrentMinutes] = useState(getCurrentMinutes);
    const currentTimeRef = useRef<HTMLDivElement>(null);

    const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
    const [payTarget, setPayTarget] = useState<Appointment | null>(null);

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
        <>
            {/* ── Modais ──────────────────────────────────────────────────── */}
            <DeleteAppointmentModal
                appointment={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDeleted={(id) => { onDeleted(id); setDeleteTarget(null); }}
            />
            <RegisterPaymentModal
                appointment={payTarget}
                onClose={() => setPayTarget(null)}
                onPaid={(id) => { onPaid(id); setPayTarget(null); }}
            />

            <div className="relative" style={{ height: totalHours * ROW_HEIGHT }}>
                {/* ── Grade de horas ───────────────────────────────────────── */}
                {hours.map((hour, i) => (
                    <div key={hour} className="absolute left-0 right-0 flex" style={{ top: i * ROW_HEIGHT }}>
                        <div className="w-14 shrink-0 -translate-y-2.5 pr-3 text-right">
                            <span className="text-[11px] font-medium tabular-nums text-muted-foreground/60">
                                {String(hour).padStart(2, '0')}:00
                            </span>
                        </div>
                        <div className="flex-1 border-t border-border/40" />
                    </div>
                ))}

                {/* ── Marcador de hora atual ───────────────────────────────── */}
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

                {/* ── Cards de agendamento ─────────────────────────────────── */}
                {appointments.length > 0 && (
                    appointments.map((appt) => {
                        const startMins = parseStartMinutes(appt.start);
                        const durationMins = parseDurationMinutes(appt.duration ?? '01:00:00');

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
                                {/* Conteúdo + botões lado a lado */}
                                <div className="flex h-full gap-2">
                                    {/* Info do agendamento */}
                                    <div className="min-w-0 flex-1">
                                        {/* Linha 1: serviço + badge */}
                                        <div className="flex items-start gap-2">
                                            <p className="min-w-0 flex-1 truncate text-base font-semibold leading-snug">
                                                {appt.service ?? '—'}
                                            </p>
                                            {height >= 60 && (
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

                                        {/* Linha 2: nome do cliente (clicável) */}
                                        {appt.client ? (
                                            <Link
                                                href={`/clients/${appt.client.id}`}
                                                className="block truncate text-sm font-semibold text-primary hover:underline"
                                            >
                                                {appt.client.name ?? '—'}
                                            </Link>
                                        ) : (
                                            <p className="truncate text-sm font-semibold">—</p>
                                        )}

                                        {/* Linha 3: duração + valor */}
                                        {height >= 78 && (
                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {appt.duration ? formatDuration(appt.duration) : '—'}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                                                    <Banknote className="h-3 w-3" />
                                                    {appt.value != null ? formatCurrency(appt.value) : '—'}
                                                </span>
                                                {appt.paid && appt.payment_method && (
                                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                        <CreditCard className="h-2.5 w-2.5" />
                                                        {METHODS_PT[appt.payment_method] ?? appt.payment_method}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Linha 4: profissional responsável */}
                                        {height >= 96 && appt.user && (
                                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                                                <User2 className="h-2.5 w-2.5" />
                                                {appt.user}
                                            </p>
                                        )}
                                    </div>

                                    {/* Botões de ação — coluna à direita */}
                                    <div className="flex shrink-0 flex-col items-center justify-center gap-1">
                                        {!appt.paid && (
                                            <button
                                                onClick={() => setPayTarget(appt)}
                                                title="Registrar pagamento"
                                                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-400"
                                            >
                                                <Wallet className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        {appt.client?.phone && (
                                            <a
                                                href={`https://wa.me/${unformatPhone(appt.client.phone)}?text=${generateWhatsAppText(appt)}`}
                                                target="_blank"
                                                title="Mandar mensagem"
                                                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-400"
                                            >
                                                <MessageCircle className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => setDeleteTarget(appt)}
                                            title="Cancelar agendamento"
                                            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}
