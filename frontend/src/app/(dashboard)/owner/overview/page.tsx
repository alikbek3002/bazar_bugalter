'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, FileText, CreditCard, AlertTriangle, TrendingUp, TrendingDown, MinusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface OverviewStats {
    spaces: {
        total: number;
        occupied: number;
        vacant: number;
        maintenance: number;
        occupancyRate: number;
    };
    tenants: {
        total: number;
    };
    contracts: {
        total: number;
        active: number;
    };
    payments: {
        total: number;
        paid: number;
        pending: number;
        overdue: number;
    };
    revenue: {
        total: number;
        pending: number;
        overdue: number;
    };
    expenses: {
        total: number;
    };
    netIncome: number;
}

export default function OwnerOverviewPage() {
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const response = await fetch(`${API_URL}/api/stats/overview`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to fetch stats');
                }

                setStats(result.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
                toast.error('Ошибка загрузки данных');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!stats) {
        return <div>Нет данных</div>;
    }

    const cards = [
        {
            title: 'Торговых мест',
            value: stats.spaces.total,
            description: `${stats.spaces.occupied} занято, ${stats.spaces.vacant} свободно`,
            icon: Building2,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Арендаторов',
            value: stats.tenants.total,
            description: `${stats.contracts.active} активных договоров`,
            icon: Users,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Заполняемость',
            value: `${stats.spaces.occupancyRate}%`,
            description: 'Процент занятых мест',
            icon: TrendingUp,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Общий доход',
            value: stats.revenue.total.toLocaleString('ru-RU', { style: 'currency', currency: 'KGS' }),
            description: 'Сумма оплаченных платежей',
            icon: CreditCard,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
        },
        {
            title: 'Расходы',
            value: stats.expenses.total.toLocaleString('ru-RU', { style: 'currency', currency: 'KGS' }),
            description: 'Общая сумма расходов',
            icon: MinusCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            title: 'Чистая прибыль',
            value: stats.netIncome.toLocaleString('ru-RU', { style: 'currency', currency: 'KGS' }),
            description: 'Доход минус расходы',
            icon: stats.netIncome >= 0 ? TrendingUp : TrendingDown,
            color: stats.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600',
            bgColor: stats.netIncome >= 0 ? 'bg-emerald-600/10' : 'bg-red-600/10',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Обзор</h1>
                <p className="text-muted-foreground">Общая статистика по рынку</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((stat) => (
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
            {stats.payments.overdue > 0 && (
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                            <AlertTriangle className="h-5 w-5" />
                            Просроченные платежи
                        </CardTitle>
                        <CardDescription className="text-orange-600 dark:text-orange-400">
                            {stats.payments.overdue} платежей с задолженностью на сумму {stats.revenue.overdue.toLocaleString('ru-RU', { style: 'currency', currency: 'KGS' })}
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
                                <Badge variant="default" className="bg-red-500">{stats.spaces.occupied}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Свободно</span>
                                <Badge variant="default" className="bg-green-500">{stats.spaces.vacant}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">На обслуживании</span>
                                <Badge variant="secondary">{stats.spaces.maintenance}</Badge>
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
                                    {stats.payments.paid}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Ожидает оплаты</span>
                                <Badge variant="default" className="bg-yellow-500">
                                    {stats.payments.pending}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Просрочено</span>
                                <Badge variant="destructive">
                                    {stats.payments.overdue}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
