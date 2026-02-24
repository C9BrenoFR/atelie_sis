import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface TimeInputProps {
    id?: string;
    value: string; // "HH:MM"
    onChange: (value: string) => void;
    className?: string;
    'aria-invalid'?: boolean;
}

function pad(n: number): string {
    return String(n).padStart(2, '0');
}

export function TimeInput({ id, value, onChange, className, 'aria-invalid': ariaInvalid }: TimeInputProps) {
    const [h, m] = value ? value.split(':').map(Number) : [0, 0];

    const hoursRef = useRef<HTMLInputElement>(null);
    const minsRef = useRef<HTMLInputElement>(null);

    const [hours, setHours] = useState(pad(h));
    const [mins, setMins] = useState(pad(m ?? 0));

    // Sincroniza quando o value externo muda
    useEffect(() => {
        const [eh, em] = value ? value.split(':') : ['00', '00'];
        setHours(eh ?? '00');
        setMins(em ?? '00');
    }, [value]);

    function emit(newH: string, newM: string) {
        const hNum = Math.min(23, Math.max(0, Number(newH) || 0));
        const mNum = Math.min(59, Math.max(0, Number(newM) || 0));
        onChange(`${pad(hNum)}:${pad(mNum)}`);
    }

    function handleHours(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
        setHours(raw);
        if (raw.length === 2 || Number(raw) > 2) {
            emit(raw, mins);
            minsRef.current?.focus();
            minsRef.current?.select();
        }
    }

    function handleMins(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
        setMins(raw);
        if (raw.length === 2) emit(hours, raw);
    }

    function handleHoursBlur() {
        const clamped = pad(Math.min(23, Math.max(0, Number(hours) || 0)));
        setHours(clamped);
        emit(clamped, mins);
    }

    function handleMinsBlur() {
        const clamped = pad(Math.min(59, Math.max(0, Number(mins) || 0)));
        setMins(clamped);
        emit(hours, clamped);
    }

    function handleHoursKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'ArrowUp') {
            const next = pad(Math.min(23, (Number(hours) || 0) + 1));
            setHours(next); emit(next, mins);
        } else if (e.key === 'ArrowDown') {
            const next = pad(Math.max(0, (Number(hours) || 0) - 1));
            setHours(next); emit(next, mins);
        } else if (e.key === ':' || e.key === 'Tab') {
            minsRef.current?.focus();
            minsRef.current?.select();
        }
    }

    function handleMinsKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'ArrowUp') {
            const next = pad(Math.min(59, (Number(mins) || 0) + 1));
            setMins(next); emit(hours, next);
        } else if (e.key === 'ArrowDown') {
            const next = pad(Math.max(0, (Number(mins) || 0) - 1));
            setMins(next); emit(hours, next);
        }
    }

    return (
        <div
            className={cn(
                'flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
                ariaInvalid && 'border-destructive focus-within:ring-destructive',
                className,
            )}
        >
            <input
                ref={hoursRef}
                id={id}
                type="text"
                inputMode="numeric"
                value={hours}
                onChange={handleHours}
                onBlur={handleHoursBlur}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleHoursKeyDown}
                className="w-6 bg-transparent text-center outline-none tabular-nums"
                placeholder="HH"
                maxLength={2}
                aria-label="Horas"
            />
            <span className="select-none px-0.5 text-muted-foreground">:</span>
            <input
                ref={minsRef}
                type="text"
                inputMode="numeric"
                value={mins}
                onChange={handleMins}
                onBlur={handleMinsBlur}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleMinsKeyDown}
                className="w-6 bg-transparent text-center outline-none tabular-nums"
                placeholder="MM"
                maxLength={2}
                aria-label="Minutos"
            />
        </div>
    );
}
