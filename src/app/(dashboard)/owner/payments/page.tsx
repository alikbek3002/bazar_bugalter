import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { PAYMENT_STATUSES, STATUS_COLORS } from '@/lib/constants';

export default async function OwnerPaymentsPage() {
    const supabase = await createClient();

    const { data: payments } = await supabase
        .from('payments')
        .select(`
      *,
      tenant:tenants(full_name, phone),
      contract:lease_contracts(
        space:market_spaces(code)
      )
    `)
        .order('period_month', { ascending: false })
        .limit(100);

    const allPayments = payments || [];
    const pendingPayments = allPayments.filter(p => p.status === 'pending');
    const overduePayments = allPayments.filter(p => p.status === 'overdue');
    const paidPayments = allPayments.filter(p => p.status === 'paid');

    const totalPending = pendingPayments.reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);
    const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.paid_amount, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Платежи</h1>
                <p className="text-muted-foreground">Обзор всех платежей по аренде</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Всего платежей</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allPayments.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ожидает оплаты</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingPayments.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalPending.toLocaleString('ru-RU')} ₸
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-red-200 dark:border-red-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">Просрочено</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{overduePayments.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalOverdue.toLocaleString('ru-RU')} ₸
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Оплачено</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{paidPayments.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalPaid.toLocaleString('ru-RU')} ₸
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payments List */}
            <Card>
                <CardHeader>
                    <CardTitle>Список платежей</CardTitle>
                    <CardDescription>
                        Последние {allPayments.length} платежей
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {allPayments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Платежи не найдены</p>
                            <p className="text-sm">Платежи создаются автоматически при наличии договоров</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium text-sm">
                                <div>Арендатор</div>
                                <div>Место</div>
                                <div>Период</div>
                                <div>Сумма</div>
                                <div>Оплачено</div>
                                <div>Статус</div>
                            </div>
                            {/* Table Body */}
                            {allPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="font-medium">{payment.tenant?.full_name || 'Не указан'}</div>
                                    <div className="text-muted-foreground">{payment.contract?.space?.code || '—'}</div>
                                    <div className="text-muted-foreground">
                                        {new Date(payment.period_month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                    </div>
                                    <div className="font-medium">{payment.charged_amount.toLocaleString('ru-RU')} ₸</div>
                                    <div className={payment.paid_amount > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                                        {payment.paid_amount.toLocaleString('ru-RU')} ₸
                                    </div>
                                    <div>
                                        <Badge className={STATUS_COLORS[payment.status as keyof typeof STATUS_COLORS]}>
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
