import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default async function AccountantPaymentsPage() {
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
        .limit(50);

    const allPayments = payments || [];
    const pendingPayments = allPayments.filter(p => p.status === 'pending');
    const overduePayments = allPayments.filter(p => p.status === 'overdue');
    const paidPayments = allPayments.filter(p => p.status === 'paid');

    const totalPending = pendingPayments.reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);
    const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Управление платежами</h1>
                <p className="text-muted-foreground">Отметка платежей и контроль задолженностей</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ожидает оплаты</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingPayments.length}</div>
                        <p className="text-xs text-muted-foreground">
                            На сумму {totalPending.toLocaleString('ru-RU')} ₸
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
                            Задолженность {totalOverdue.toLocaleString('ru-RU')} ₸
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Оплачено</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{paidPayments.length}</div>
                        <p className="text-xs text-muted-foreground">За текущий период</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payments List */}
            <Card>
                <CardHeader>
                    <CardTitle>Последние платежи</CardTitle>
                    <CardDescription>
                        Нажмите на платёж для отметки оплаты
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {allPayments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Платежи не найдены</p>
                            <p className="text-sm">Создайте договоры для генерации платежей</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {allPayments.slice(0, 10).map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">{payment.tenant?.full_name || 'Неизвестный арендатор'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.contract?.space?.code || 'Место не указано'} • {new Date(payment.period_month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="font-bold">{payment.charged_amount.toLocaleString('ru-RU')} ₸</p>
                                        <Badge
                                            variant={
                                                payment.status === 'paid' ? 'default' :
                                                    payment.status === 'overdue' ? 'destructive' :
                                                        payment.status === 'partial' ? 'secondary' : 'outline'
                                            }
                                            className={payment.status === 'paid' ? 'bg-green-500' : ''}
                                        >
                                            {payment.status === 'paid' ? 'Оплачен' :
                                                payment.status === 'overdue' ? 'Просрочен' :
                                                    payment.status === 'partial' ? 'Частично' : 'Ожидает'}
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
