import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, FileText, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react';

export default async function OwnerOverviewPage() {
    const supabase = await createClient();

    // Получаем статистику
    const [spacesResult, tenantsResult, contractsResult, paymentsResult] = await Promise.all([
        supabase.from('market_spaces').select('id, status'),
        supabase.from('tenants').select('id'),
        supabase.from('lease_contracts').select('id, status'),
        supabase.from('payments').select('id, status, charged_amount, paid_amount'),
    ]);

    const spaces = spacesResult.data || [];
    const tenants = tenantsResult.data || [];
    const contracts = contractsResult.data || [];
    const payments = paymentsResult.data || [];

    // Считаем метрики
    const totalSpaces = spaces.length;
    const occupiedSpaces = spaces.filter(s => s.status === 'occupied').length;
    const vacantSpaces = spaces.filter(s => s.status === 'vacant').length;
    const occupancyRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;

    const totalTenants = tenants.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;

    const overduePayments = payments.filter(p => p.status === 'overdue');
    const totalDebt = overduePayments.reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.paid_amount, 0);

    const stats = [
        {
            title: 'Торговых мест',
            value: totalSpaces,
            description: `${occupiedSpaces} занято, ${vacantSpaces} свободно`,
            icon: Building2,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Арендаторов',
            value: totalTenants,
            description: `${activeContracts} активных договоров`,
            icon: Users,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Заполняемость',
            value: `${occupancyRate}%`,
            description: 'Процент занятых мест',
            icon: TrendingUp,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Общий доход',
            value: totalRevenue.toLocaleString('ru-RU'),
            description: 'Сумма оплаченных платежей',
            icon: CreditCard,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Обзор</h1>
                <p className="text-muted-foreground">Общая статистика по рынку</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Alerts */}
            {overduePayments.length > 0 && (
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                            <AlertTriangle className="h-5 w-5" />
                            Просроченные платежи
                        </CardTitle>
                        <CardDescription className="text-orange-600 dark:text-orange-400">
                            {overduePayments.length} платежей с задолженностью на сумму {totalDebt.toLocaleString('ru-RU')} ₸
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {/* Quick Info Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Статус мест</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Занято</span>
                                <Badge variant="default" className="bg-red-500">{occupiedSpaces}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Свободно</span>
                                <Badge variant="default" className="bg-green-500">{vacantSpaces}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">На обслуживании</span>
                                <Badge variant="secondary">{spaces.filter(s => s.status === 'maintenance').length}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Статус платежей</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Оплачено</span>
                                <Badge variant="default" className="bg-green-500">
                                    {payments.filter(p => p.status === 'paid').length}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Ожидает оплаты</span>
                                <Badge variant="default" className="bg-yellow-500">
                                    {payments.filter(p => p.status === 'pending').length}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Просрочено</span>
                                <Badge variant="destructive">
                                    {overduePayments.length}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
