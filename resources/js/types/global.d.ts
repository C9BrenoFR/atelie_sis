import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            clinic: {
                open_hour: number;
                close_hour: number;
            };
            clients: { id: number; name: string }[];
            services: { id: number; title: string; duration: string; value: number }[];
            users: { id: number; name: string }[];
            paymentMethods: string[];
            [key: string]: unknown;
        };
    }
}
