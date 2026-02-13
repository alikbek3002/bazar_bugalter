'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    LayoutDashboard,
    MapPin,
    Users,
    FileText,
    CreditCard,
    BarChart3,
    LogOut,
    Bell,
    ChevronLeft,
    History,
    MinusCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { createClient } from '@/lib/supabase/client';
import { USER_ROLES } from '@/lib/constants';
import type { UserRole } from '@/types/database';

interface DashboardSidebarProps {
    role: UserRole;
    userName?: string;
}

const ownerMenuItems = [
    { title: 'Обзор', href: '/owner/overview', icon: LayoutDashboard },
    { title: 'Торговые места', href: '/owner/spaces', icon: MapPin },
    { title: 'Арендаторы', href: '/owner/tenants', icon: Users },
    { title: 'Платежи', href: '/owner/payments', icon: CreditCard },
    { title: 'Расходы', href: '/owner/expenses', icon: MinusCircle },
    { title: 'Отчёты', href: '/owner/reports', icon: BarChart3 },
];

const accountantMenuItems = [
    { title: 'Торговые места', href: '/accountant/spaces', icon: MapPin },
    { title: 'Арендаторы', href: '/accountant/tenants', icon: Users },
    { title: 'Платежи', href: '/accountant/payments', icon: CreditCard },
    { title: 'Расходы', href: '/accountant/expenses', icon: MinusCircle },
    { title: 'Отчёты', href: '/accountant/reports', icon: BarChart3 },
];

const tenantMenuItems = [
    { title: 'Мой кабинет', href: '/tenant/dashboard', icon: LayoutDashboard },
    { title: 'История платежей', href: '/tenant/history', icon: History },
];

export function DashboardSidebar({ role, userName }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = role === 'owner'
        ? ownerMenuItems
        : role === 'accountant'
            ? accountantMenuItems
            : tenantMenuItems;

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success('Вы вышли из системы');
        router.push('/login');
    };

    return (
        <Sidebar className="border-r border-slate-200 dark:border-slate-800">
            <SidebarHeader className="p-4">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Bazar Bugalter</h1>
                        <Badge variant="secondary" className="text-xs">
                            {USER_ROLES[role]}
                        </Badge>
                    </div>
                </Link>
            </SidebarHeader>

            <Separator />

            <SidebarContent>
                <ScrollArea className="h-full">
                    <div className="p-2">
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        className={cn(
                                            'w-full justify-start',
                                            pathname === item.href && 'bg-slate-100 dark:bg-slate-800'
                                        )}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </div>
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col gap-2">
                    {userName && (
                        <p className="text-sm text-muted-foreground truncate">
                            {userName}
                        </p>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

export function DashboardLayout({
    children,
    role,
    userName
}: {
    children: React.ReactNode;
    role: UserRole;
    userName?: string;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <DashboardSidebar role={role} userName={userName} />
                <main className="flex-1 flex flex-col">
                    <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4">
                        <SidebarTrigger />
                        <div className="flex-1" />
                        <Button variant="ghost" size="icon">
                            <Bell className="h-5 w-5" />
                        </Button>
                    </header>
                    <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
