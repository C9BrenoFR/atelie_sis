import { Link, usePage } from '@inertiajs/react';
import { Banknote, Calendar, Clipboard, LayoutGrid, Users } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';

const mainNavItems: NavItem[] = [
    {
        title: 'Agendamentos',
        href: dashboard(),
        icon: Calendar,
    },
    {
        title: 'Clientes',
        href: '/clients',
        icon: Users,
    },
    {
        title: 'Serviços',
        href: '/services',
        icon: Clipboard,
    },
    {
        title: 'Pagamentos',
        href: '/payments',
        icon: Banknote,
    },
];

const AdminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/data-analysis',
        icon: LayoutGrid,
    },
    {
        title: 'Funcionarios',
        href: '/users',
        icon: Users,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth.user

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {user.is_admin && (
                    <NavMain title='Administrativo' items={AdminNavItems} />
                )}
                <NavMain title='Plataforma' items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
