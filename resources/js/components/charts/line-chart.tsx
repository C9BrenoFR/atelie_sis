import { LineChart } from '@mui/x-charts/LineChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

const CHART_HEIGHT = 460;

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

interface MonthLineChartProps {
    days: number[];
    income: number[];
    expenses: number[];
}

export default function MonthLineChart({ days, income, expenses }: MonthLineChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(400);
    const { resolvedAppearance } = useAppearance();

    const muiTheme = createTheme({ palette: { mode: resolvedAppearance } });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver(([entry]) => {
            setWidth(Math.floor(entry.contentRect.width));
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <ThemeProvider theme={muiTheme}>
            <div ref={containerRef} className="w-full overflow-hidden">
                <LineChart
                    xAxis={[{ data: days, valueFormatter: (v: number) => String(v), label: 'Dia' }]}
                    series={[
                        {
                            data: income,
                            label: 'Ganhos',
                            color: '#22c55e',
                            valueFormatter: (v) => formatCurrency(v ?? 0),
                        },
                        {
                            data: expenses,
                            label: 'Gastos',
                            color: '#ef4444',
                            valueFormatter: (v) => formatCurrency(v ?? 0),
                        },
                    ]}
                    width={width || 400}
                    height={CHART_HEIGHT}
                    sx={{
                        '& .MuiChartsGrid-horizontalLine': {
                            stroke: 'var(--border)',
                            opacity: 0.4,
                        },
                    }}
                />
            </div>
        </ThemeProvider>
    );
}
