'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertTriangle, CheckCircle, Clock, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PAYMENT_STATUSES, STATUS_COLORS } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Payment {
    id: string;
    period_month: string;
    charged_amount: number;
    paid_amount: number;
    status: string;
    tenant?: {
        full_name: string;
        phone: string;
    };
    contract?: {
        space?: {
            code: string;
        };
    };
}

export default function OwnerPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const response = await fetch(`${API_URL}/api/payments?limit=100`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to fetch payments');
                }

                setPayments(result.data);
            } catch (error) {
                console.error('Error fetching payments:', error);
                toast.error('Ошибка загрузки платежей');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const pendingPayments = payments.filter(p => p.status === 'pending');
    const overduePayments = payments.filter(p => p.status === 'overdue');
    const paidPayments = payments.filter(p => p.status === 'paid');

    const totalPending = pendingPayments.reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);
    const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.charged_amount - p.paid_amount), 0);
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.paid_amount, 0);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Платежи</h1>
                    <p className="text-muted-foreground">Обзор всех платежей по аренде</p>
                </div>
                <Link href="/owner/payments/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить платёж
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Всего платежей</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{payments.length}</div>
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
                            {totalPending.toLocaleString('ru-RU')} с
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
                            {totalOverdue.toLocaleString('ru-RU')} с
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
                            {totalPaid.toLocaleString('ru-RU')} с
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payments List */}
            <Card>
                <CardHeader>
                    <CardTitle>Список платежей</CardTitle>
                    <CardDescription>
                        Последние {payments.length} платежей
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {payments.length === 0 ? (
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
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="font-medium">{payment.tenant?.full_name || 'Не указан'}</div>
                                    <div className="text-muted-foreground">{payment.contract?.space?.code || '—'}</div>
                                    <div className="text-muted-foreground">
                                        {new Date(payment.period_month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                    </div>
                                    <div className="font-medium">{payment.charged_amount.toLocaleString('ru-RU')} с</div>
                                    <div className={payment.paid_amount > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                                        {payment.paid_amount.toLocaleString('ru-RU')} с
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
