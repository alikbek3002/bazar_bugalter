import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, TrendingUp, TrendingDown, Building2, Users, CreditCard } from 'lucide-react';

export default async function OwnerReportsPage() {
    const supabase = await createClient();

    // Получаем статистику
    const [spacesResult, tenantsResult, contractsResult, paymentsResult] = await Promise.all([
        supabase.from('market_spaces').select('id, status, area_sqm'),
        supabase.from('tenants').select('id'),
        supabase.from('lease_contracts').select('id, status, monthly_rent'),
        supabase.from('payments').select('id, status, charged_amount, paid_amount, period_month'),
    ]);

    const spaces = spacesResult.data || [];
    const tenants = tenantsResult.data || [];
    const contracts = contractsResult.data || [];
    const payments = paymentsResult.data || [];

    // Метрики
    const totalSpaces = spaces.length;
    const occupiedSpaces = spaces.filter(s => s.status === 'occupied').length;
    const occupancyRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;
    const totalArea = spaces.reduce((sum, s) => sum + (s.area_sqm || 0), 0);

    const activeContracts = contracts.filter(c => c.status === 'active');
    const monthlyIncome = activeContracts.reduce((sum, c) => sum + c.monthly_rent, 0);

    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthPayments = payments.filter(p => p.period_month.startsWith(thisMonth));
    const paidThisMonth = thisMonthPayments.filter(p => p.status === 'paid');
    const collectedThisMonth = paidThisMonth.reduce((sum, p) => sum + p.paid_amount, 0);

    const totalDebt = payments
        .filter(p => p.status === 'overdue' || p.status === 'pending')
        .reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Отчёты</h1>
                    <p className="text-muted-foreground">Аналитика и статистика рынка</p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Экспорт в Excel
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Заполняемость</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{occupancyRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {occupiedSpaces} из {totalSpaces} мест
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Потенциальный доход</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyIncome.toLocaleString('ru-RU')} с</div>
                        <p className="text-xs text-muted-foreground">
                            Сумма аренды активных договоров
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Собрано в этом месяце</CardTitle>
                        <CreditCard className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{collectedThisMonth.toLocaleString('ru-RU')} с</div>
                        <p className="text-xs text-muted-foreground">
                            {paidThisMonth.length} платежей
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">Общая задолженность</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{totalDebt.toLocaleString('ru-RU')} с</div>
                        <p className="text-xs text-muted-foreground">
                            Неоплаченные платежи
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Сводка по площадям</CardTitle>
                        <CardDescription>Информация о торговых площадях</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Общая площадь</span>
                            <span className="font-bold">{totalArea.toFixed(1)} м²</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Всего мест</span>
                            <span className="font-bold">{totalSpaces}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Занято</span>
                            <span className="font-bold text-red-600">{occupiedSpaces}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Свободно</span>
                            <span className="font-bold text-green-600">{totalSpaces - occupiedSpaces}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Сводка по арендаторам</CardTitle>
                        <CardDescription>Информация об арендаторах</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Всего арендаторов</span>
                            <span className="font-bold">{tenants.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Активных договоров</span>
                            <span className="font-bold">{activeContracts.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Средняя аренда</span>
                            <span className="font-bold">
                                {activeContracts.length > 0
                                    ? Math.round(monthlyIncome / activeContracts.length).toLocaleString('ru-RU')
                                    : 0} с
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rent Roll Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Rent Roll</CardTitle>
                    <CardDescription>Таблица всех активных договоров аренды</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Подробный Rent Roll доступен через экспорт в Excel</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
