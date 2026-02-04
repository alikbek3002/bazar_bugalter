import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { PAYMENT_STATUSES, PAYMENT_METHODS } from '@/lib/constants';

export default async function TenantHistoryPage() {
    const supabase = await createClient();

    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Ошибка авторизации</div>;
    }

    // Получаем арендатора по user_id
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!tenant) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">История платежей</h1>
                <p className="text-muted-foreground">Профиль арендатора не найден</p>
            </div>
        );
    }

    // Получаем все платежи
    const { data: payments } = await supabase
        .from('payments')
        .select(`
      *,
      contract:lease_contracts(
        space:market_spaces(code)
      )
    `)
        .eq('tenant_id', tenant.id)
        .order('period_month', { ascending: false });

    const allPayments = payments || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">История платежей</h1>
                <p className="text-muted-foreground">Полная история всех ваших платежей</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Все платежи</CardTitle>
                    <CardDescription>
                        Всего {allPayments.length} платежей
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {allPayments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>История платежей пуста</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {allPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 rounded-lg border"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {new Date(payment.period_month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.contract?.space?.code || 'Место не указано'}
                                        </p>
                                        {payment.payment_date && (
                                            <p className="text-xs text-muted-foreground">
                                                Оплачено {new Date(payment.payment_date).toLocaleDateString('ru-RU')}
                                                {payment.payment_method && ` • ${PAYMENT_METHODS[payment.payment_method as keyof typeof PAYMENT_METHODS]}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p className="font-bold text-lg">{payment.charged_amount.toLocaleString('ru-RU')} с</p>
                                        {payment.paid_amount > 0 && payment.paid_amount < payment.charged_amount && (
                                            <p className="text-xs text-muted-foreground">
                                                Оплачено: {payment.paid_amount.toLocaleString('ru-RU')} с
                                            </p>
                                        )}
                                        {payment.discount_amount > 0 && (
                                            <p className="text-xs text-green-600">
                                                Скидка: {payment.discount_amount.toLocaleString('ru-RU')} с
                                            </p>
                                        )}
                                        <Badge
                                            variant={
                                                payment.status === 'paid' ? 'default' :
                                                    payment.status === 'overdue' ? 'destructive' :
                                                        payment.status === 'partial' ? 'secondary' : 'outline'
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
