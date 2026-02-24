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
            [key: string]: unknown;
        };
    }
}
