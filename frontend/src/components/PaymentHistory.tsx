'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PAYMENT_STATUSES, STATUS_COLORS } from '@/lib/constants';
import { Calendar, Receipt } from 'lucide-react';

interface Payment {
    id: string;
    period_month: string;
    charged_amount: number;
    paid_amount: number;
    status: string;
    payment_date?: string;
    due_date?: string;
}

interface PaymentHistoryProps {
    payments: Payment[];
    title?: string;
}

export function PaymentHistory({ payments, title = 'История платежей' }: PaymentHistoryProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU').format(amount) + ' сом';
    };

    if (payments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Платежей пока нет</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>
                    Последние {payments.length} платежей
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium">
                        <div>Период</div>
                        <div>Начислено</div>
                        <div>Оплачено</div>
                        <div>Статус</div>
                        <div>Дата оплаты</div>
                    </div>

                    {/* Rows */}
                    {payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="grid grid-cols-5 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="font-medium">
                                {formatDate(payment.period_month)}
                            </div>
                            <div className="text-muted-foreground">
                                {formatCurrency(payment.charged_amount)}
                            </div>
                            <div className={payment.paid_amount >= payment.charged_amount ? 'text-green-600' : 'text-orange-600'}>
                                {formatCurrency(payment.paid_amount)}
                            </div>
                            <div>
                                <Badge className={STATUS_COLORS[payment.status as keyof typeof STATUS_COLORS] || 'bg-gray-100'}>
                                    {PAYMENT_STATUSES[payment.status as keyof typeof PAYMENT_STATUSES] || payment.status}
                                </Badge>
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {payment.payment_date
                                    ? new Date(payment.payment_date).toLocaleDateString('ru-RU')
                                    : '—'
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
