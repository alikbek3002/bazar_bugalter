import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { SPACE_TYPES, PAYMENT_STATUSES } from '@/lib/constants';

export default async function TenantDashboardPage() {
    const supabase = await createClient();

    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Ошибка авторизации</div>;
    }

    // Получаем арендатора по user_id
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (!tenant) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Личный кабинет</h1>
                <Card>
                    <CardContent className="py-8 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Ваш профиль арендатора не найден</p>
                        <p className="text-sm text-muted-foreground">Обратитесь к администратору</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Получаем договоры и места
    const { data: contracts } = await supabase
        .from('lease_contracts')
        .select(`
      *,
      space:market_spaces(*)
    `)
        .eq('tenant_id', tenant.id)
        .eq('status', 'active');

    // Получаем платежи
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('period_month', { ascending: false })
        .limit(12);

    const activeContracts = contracts || [];
    const allPayments = payments || [];
    const pendingPayments = allPayments.filter(p => p.status === 'pending' || p.status === 'overdue');
    const totalMonthlyRent = activeContracts.reduce((sum, c) => sum + c.monthly_rent, 0);
    const totalDebt = pendingPayments.reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Добро пожаловать, {tenant.full_name}!</h1>
                <p className="text-muted-foreground">Информация о ваших арендных местах и платежах</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Арендуемых мест</CardTitle>
                        <MapPin className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeContracts.length}</div>
                        <p className="text-xs text-muted-foreground">Активных договоров</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ежемесячная плата</CardTitle>
                        <CreditCard className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMonthlyRent.toLocaleString('ru-RU')} ₸</div>
                        <p className="text-xs text-muted-foreground">Общая сумма аренды</p>
                    </CardContent>
                </Card>

                <Card className={totalDebt > 0 ? 'border-red-200 dark:border-red-800' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={`text-sm font-medium ${totalDebt > 0 ? 'text-red-600' : ''}`}>
                            Текущая задолженность
                        </CardTitle>
                        {totalDebt > 0 ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {totalDebt > 0 ? `${totalDebt.toLocaleString('ru-RU')} ₸` : 'Нет задолженности'}
                        </div>
                        {totalDebt > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {pendingPayments.length} неоплаченных платежей
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Active Spaces */}
            <Card>
                <CardHeader>
                    <CardTitle>Мои торговые места</CardTitle>
                    <CardDescription>Список арендуемых мест</CardDescription>
                </CardHeader>
                <CardContent>
                    {activeContracts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Нет активных арендных мест</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeContracts.map((contract) => (
                                <div
                                    key={contract.id}
                                    className="flex items-center justify-between p-4 rounded-lg border"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">{contract.space?.code}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {contract.space?.space_type && SPACE_TYPES[contract.space.space_type as keyof typeof SPACE_TYPES]} • {contract.space?.area_sqm} м²
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Договор с {new Date(contract.start_date).toLocaleDateString('ru-RU')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{contract.monthly_rent.toLocaleString('ru-RU')} ₸</p>
                                        <p className="text-xs text-muted-foreground">в месяц</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
                <CardHeader>
                    <CardTitle>Последние платежи</CardTitle>
                    <CardDescription>История ваших платежей</CardDescription>
                </CardHeader>
                <CardContent>
                    {allPayments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>История платежей пуста</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {allPayments.slice(0, 6).map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 rounded-lg border"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {new Date(payment.period_month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                        </p>
                                        {payment.payment_date && (
                                            <p className="text-xs text-muted-foreground">
                                                Оплачено {new Date(payment.payment_date).toLocaleDateString('ru-RU')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="font-bold">{payment.charged_amount.toLocaleString('ru-RU')} ₸</p>
                                        <Badge
                                            variant={
                                                payment.status === 'paid' ? 'default' :
                                                    payment.status === 'overdue' ? 'destructive' :
                                                        'outline'
                                            }
                                            className={payment.status === 'paid' ? 'bg-green-500' : ''}
                                        >
                                            {PAYMENT_STATUSES[payment.status as keyof typeof PAYMENT_STATUSES]}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
