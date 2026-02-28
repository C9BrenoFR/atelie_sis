
interface DashboardCardProps {
    value: string | number,
    label: string
}

export default function DashboardCard({ value, label }: DashboardCardProps) {
    return (
        <div className="flex flex-col items-center justify-center aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
            <p className='text-4xl'>{value}</p>
            <p>{label}</p>
        </div>
    );
};
