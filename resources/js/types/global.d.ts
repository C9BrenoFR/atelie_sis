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
            clientOptions: { id: number; name: string }[];
            serviceOptions: { id: number; title: string; duration: string; value: number }[];
            userOptions: { id: number; name: string }[];
            paymentMethods: string[];
            [key: string]: unknown;
        };
    }
}
