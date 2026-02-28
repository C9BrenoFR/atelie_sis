import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { CalendarDays, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Payment } from '@/types/models';
import { cn } from '@/lib/utils';
import DonutChart from '@/components/charts/donut-chart';
import MonthLineChart from '@/components/charts/line-chart';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import DashboardCard from '@/components/ui/dashboard-card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Agendamentos', href: dashboard().url },
    { title: 'Analise de Dados', href: dashboard().url },
];

interface DashboardProps {
    appointments_count: number;
    appointments_not_paid: number;
    month_not_paid: number;
    payments: Payment[];
    month: string; // "dd/mm/yyyy"
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const CHART_COLORS = [
    '#6366f1', '#f59e0b', '#10b981', '#3b82f6',
    '#ec4899', '#14b8a6', '#f97316', '#8b5cf6',
    '#06b6d4', '#84cc16',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Dashboard({ appointments_count, appointments_not_paid, month_not_paid, payments, month }: DashboardProps) {
    const [monthModalOpen, setMonthModalOpen] = useState(false);

    // Parse "dd/mm/yyyy" -> parts
    const [, monthStr, yearStr] = month.split('/');
    const monthInputDefault = `${yearStr}-${monthStr}`;
    const [selectedMonth, setSelectedMonth] = useState(monthInputDefault);

    const monthDisplayLabel = useMemo(() => {
        return new Date(Number(yearStr), Number(monthStr) - 1, 1)
            .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }, [monthStr, yearStr]);

    // ---------------------------------------------------------------------------
    // Chart data (memoized for stable colors and avoid re-computation)
    // ---------------------------------------------------------------------------
    const { PaymentMethodPieChart, gross_profit } = useMemo(() => {
        let gross = 0;
        const grouped: Record<string, { label: string; value: number; color: string }> = {};
        payments.filter(p => p.is_enter).forEach(p => {
            const method = p.method;
            if (!grouped[method]) {
                grouped[method] = {
                    label: method,
                    value: 0,
                    color: CHART_COLORS[Object.keys(grouped).length % CHART_COLORS.length],
                };
            }
            grouped[method].value += Number(p.value);
            gross += Number(p.value);
        });
        const data = Object.values(grouped).map(item => ({
            ...item,
            value: Math.round(item.value * 100) / 100,
        }));
        return { PaymentMethodPieChart: data, gross_profit: Math.round(gross * 100) / 100 };
    }, [payments]);

    const { ProfitPieChart, net_profit } = useMemo(() => {
        let net = 0;
        const grouped: Record<string, { label: string; value: number; color: string }> = {};
        payments.forEach(p => {
            const type = p.is_enter ? 'Ganho' : 'Gasto';
            if (!grouped[type]) {
                grouped[type] = {
                    label: type,
                    value: 0,
                    color: type === 'Ganho' ? '#22c55e' : '#ef4444',
                };
            }
            grouped[type].value += Number(p.value);
            net += p.is_enter ? Number(p.value) : -Number(p.value);
        });
        const data = Object.values(grouped).map(item => ({
            ...item,
            value: Math.round(item.value * 100) / 100,
        }));
        return { ProfitPieChart: data, net_profit: Math.round(net * 100) / 100 };
    }, [payments]);

    // Line chart: group by day of month
    const { days, incomeByDay, expenseByDay } = useMemo(() => {
        const daysInMonth = new Date(Number(yearStr), Number(monthStr), 0).getDate();
        const income = new Array(daysInMonth).fill(0);
        const expenses = new Array(daysInMonth).fill(0);

        payments.forEach(p => {
            const d = new Date(p.created_at);
            const dayIndex = d.getDate() - 1;
            if (dayIndex >= 0 && dayIndex < daysInMonth) {
                if (p.is_enter) income[dayIndex] += Number(p.value);
                else expenses[dayIndex] += Number(p.value);
            }
        });

        return {
            days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
            incomeByDay: income.map(v => Math.round(v * 100) / 100),
            expenseByDay: expenses.map(v => Math.round(v * 100) / 100),
        };
    }, [payments, monthStr, yearStr]);

    const handleMonthChange = () => {
        router.get('/data-analysis', { month: selectedMonth });
        setMonthModalOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Análise de Dados" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                {/* ── Top bar ── */}
                <div className="flex items-center justify-between rounded-xl border border-sidebar-border/70 dark:border-sidebar-border px-4 py-3">
                    <div>
                        <h1 className="text-lg font-semibold text-foreground capitalize">{monthDisplayLabel}</h1>
                        <p className="text-sm text-muted-foreground">Análise financeira do período</p>
                    </div>
                    <Button variant="outline" onClick={() => setMonthModalOpen(true)}>
                        <CalendarDays className="h-4 w-4" />
                        Trocar Mês
                    </Button>
                </div>

                {/* ── Stats cards (placeholders) ── */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <DashboardCard
                        value={appointments_count}
                        label='Consultas marcadas esse mês'
                    />
                    <DashboardCard
                        value={appointments_not_paid}
                        label='Consultas não pagas desse mês'
                    />
                    <DashboardCard
                        value={`R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(month_not_paid)}`}
                        label='Valor a receber de consultas desse mês'
                    />
                </div>

                {/* ── Main content ── */}
                <div className="flex overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-2 gap-2">

                    {/* Payments table */}
                    <div className="w-1/2">
                        <div className="rounded-xl border border-border">
                            <table className="w-full text-sm">
                                <thead className="block">
                                    <tr className="table w-full table-fixed border-b border-border bg-muted/40">
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">Tipo</th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">Título</th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">Descrição</th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">Método</th>
                                        <th className="px-4 py-3 text-left font-semibold text-foreground">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="block max-h-120 overflow-y-auto">
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
                                                    'table w-full table-fixed border-b border-border transition-colors last:border-0 hover:bg-muted/30',
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
                                                <td className="px-4 py-3 text-muted-foreground">{payment.method}</td>
                                                <td className={cn(
                                                    'px-4 py-3 font-medium',
                                                    payment.is_enter
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400',
                                                )}>
                                                    {payment.is_enter ? '+' : '−'} {formatCurrency(payment.value)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Charts grid */}
                    <div className="w-1/2 min-h-0 overflow-hidden grid grid-cols-2 grid-rows-2 gap-3">

                        {/* Donut — Métodos de Pagamento */}
                        <div className="rounded flex flex-col items-center justify-center gap-1">
                            <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                                Métodos de Pagamento
                            </span>
                            <DonutChart data={PaymentMethodPieChart} label={gross_profit} />
                        </div>

                        {/* Line chart — Evolução Mensal (row-span-2) */}
                        <div className="rounded row-span-2 col-start-2 flex flex-col gap-1 pt-1 overflow-hidden">
                            <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase text-center">
                                Evolução Mensal
                            </span>
                            <MonthLineChart days={days} income={incomeByDay} expenses={expenseByDay} />
                        </div>

                        {/* Donut — Lucro Líquido */}
                        <div className="rounded row-start-2 flex flex-col items-center justify-center gap-1">
                            <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                                Lucro Líquido
                            </span>
                            <DonutChart data={ProfitPieChart} label={net_profit} />
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Month picker modal ── */}
            <Dialog open={monthModalOpen} onOpenChange={setMonthModalOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Selecionar Mês</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button onClick={handleMonthChange}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

