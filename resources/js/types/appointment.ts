export interface Appointment {
    id: number;
    date: string;            // "YYYY-MM-DD"
    start: string;           // "HH:MM"
    client: string | null;
    service: string | null;
    duration: string | null; // "HH:MM:SS"
    value: number | null;
    user: string | null;
    paid: boolean;
    payment_method: string | null;
}
