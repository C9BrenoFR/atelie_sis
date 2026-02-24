import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const MONTHS_PT = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// Abreviações iniciando no Domingo (padrão BR)
const DAY_ABBR = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function formatLocalDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface MiniCalendarProps {
    selected: string;                 // "YYYY-MM-DD"
    onSelect: (date: string) => void;
}

export function MiniCalendar({ selected, onSelect }: MiniCalendarProps) {
    const today = formatLocalDate(new Date());

    const [viewYear, setViewYear] = useState(() => new Date(selected + 'T12:00:00').getFullYear());
    const [viewMonth, setViewMonth] = useState(() => new Date(selected + 'T12:00:00').getMonth());

    // Sincroniza a visão quando o dia selecionado muda de mês (ex: navegando prev/next day)
    useEffect(() => {
        const d = new Date(selected + 'T12:00:00');
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
    }, [selected]);

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Domingo

    // Cria as células: null para padding, number para os dias
    const cells: (number | null)[] = [
        ...Array<null>(firstDayOfWeek).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const handlePrev = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const handleNext = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    return (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
            {/* Cabeçalho mês/ano */}
            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">
                    {MONTHS_PT[viewMonth]} {viewYear}
                </span>
                <div className="flex gap-0.5">
                    <button
                        onClick={handlePrev}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Próximo mês"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Nomes dos dias */}
            <div className="mb-1 grid grid-cols-7 text-center">
                {DAY_ABBR.map((d, i) => (
                    <span key={i} className="py-1 text-[11px] font-medium text-muted-foreground">
                        {d}
                    </span>
                ))}
            </div>

            {/* Grade de dias */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((day, i) => {
                    if (!day) return <span key={i} />;

                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = dateStr === selected;
                    const isToday = dateStr === today;

                    return (
                        <button
                            key={i}
                            onClick={() => onSelect(dateStr)}
                            className={cn(
                                'mx-auto flex h-7 w-7 items-center justify-center rounded-full text-sm transition-colors',
                                isSelected &&
                                'bg-primary font-semibold text-primary-foreground',
                                !isSelected &&
                                isToday &&
                                'font-semibold text-primary ring-1 ring-primary',
                                !isSelected &&
                                !isToday &&
                                'text-foreground hover:bg-accent',
                            )}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
