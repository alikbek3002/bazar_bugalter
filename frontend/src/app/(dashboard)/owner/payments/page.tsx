'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2, Plus, AlertTriangle, Clock, CheckCircle, Banknote } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const STATUS_LABELS: Record<string, string> = {
    pending: 'Ожидает',
    paid: 'Оплачен',
    partial: 'Частично',
    overdue: 'Просрочен',
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-blue-100 text-blue-800',
    overdue: 'bg-red-100 text-red-800',
};

interface Payment {
    id: string;
    charged_amount: number;
    paid_amount: number;
    status: string;
    period_start: string;
    period_end: string;
    payment_method?: string;
    due_date?: string;
    paid_at?: string;
    notes?: string;
    contract?: {
        id: string;
        tenant?: {
            id: string;
            full_name: string;
        };
        space?: {
            id: string;
            code: string;
        };
    };
}

export default function OwnerPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [payAmount, setPayAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_URL}/api/payments?limit=200`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to fetch');
            }

            setPayments(result.data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Ошибка загрузки платежей');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const openPayModal = (payment: Payment) => {
        const remaining = payment.charged_amount - payment.paid_amount;
        setSelectedPayment(payment);
        setPayAmount(remaining.toString());
        setShowPayModal(true);
    };

    const handlePay = async () => {
        if (!selectedPayment || !payAmount) return;

        const amount = parseFloat(payAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Введите корректную сумму');
            return;
        }

        const remaining = selectedPayment.charged_amount - selectedPayment.paid_amount;
        if (amount > remaining) {
            toast.error(`Сумма не может превышать остаток (${remaining.toLocaleString('ru-RU')} сом)`);
            return;
        }

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/payments/${selectedPayment.id}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success(
                amount >= remaining
                    ? 'Платёж полностью оплачен!'
                    : `Частичная оплата ${amount.toLocaleString('ru-RU')} сом принята`
            );

            setShowPayModal(false);
            setSelectedPayment(null);
            setPayAmount('');
            await fetchPayments();
        } catch (error: any) {
            console.error('Pay error:', error);
            toast.error(error.message || 'Ошибка оплаты');
        } finally {
            setIsProcessing(false);
        }
    };

    // Stats
    const paid = payments.filter(p => p.status === 'paid');
    const pending = payments.filter(p => p.status === 'pending');
    const partial = payments.filter(p => p.status === 'partial');
    const overdue = payments.filter(p => p.status === 'overdue');

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
                    <p className="text-muted-foreground">Управление платежами арендаторов</p>
                </div>
                <Link href="/owner/payments/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Новый платёж
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Оплачено</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{paid.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ожидает</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pending.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Частично</CardTitle>
                        <Banknote className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{partial.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Просрочено</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{overdue.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Payments List */}
            <Card>
                <CardHeader>
                    <CardTitle>Список платежей</CardTitle>
                    <CardDescription>Всего {payments.length} записей</CardDescription>
                </CardHeader>
                <CardContent>
                    {payments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Платежей нет</p>
                            <p className="text-sm mb-4">Создайте первый платёж</p>
                            <Link href="/owner/payments/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Новый платёж
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-7 gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium text-sm">
                                <div>Арендатор</div>
                                <div>Место</div>
                                <div>Период</div>
                                <div>Начислено</div>
                                <div>Оплачено</div>
                                <div>Статус</div>
                                <div>Действия</div>
                            </div>
                            {/* Table Body */}
                            {payments.map((payment) => {
                                const remaining = payment.charged_amount - payment.paid_amount;
                                const canPay = ['pending', 'partial', 'overdue'].includes(payment.status);

                                return (
                                    <div
                                        key={payment.id}
                                        className="grid grid-cols-7 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="font-medium">
                                            {payment.contract?.tenant?.full_name || '—'}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {payment.contract?.space?.code || '—'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(payment.period_start).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}
                                            {' – '}
                                            {new Date(payment.period_end).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="font-medium">
                                            {payment.charged_amount.toLocaleString('ru-RU')} сом
                                        </div>
                                        <div className={`font-medium ${payment.paid_amount >= payment.charged_amount ? 'text-green-600' : payment.paid_amount > 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                                            {payment.paid_amount.toLocaleString('ru-RU')} сом
                                            {remaining > 0 && (
                                                <span className="block text-xs text-red-500">
                                                    Остаток: {remaining.toLocaleString('ru-RU')}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <Badge className={STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'}>
                                                {STATUS_LABELS[payment.status] || payment.status}
                                            </Badge>
                                        </div>
                                        <div>
                                            {canPay && (
                                                <Button
                                                    size="sm"
                                                    variant={payment.status === 'overdue' ? 'destructive' : 'default'}
                                                    onClick={() => openPayModal(payment)}
                                                >
                                                    <Banknote className="h-3 w-3 mr-1" />
                                                    {payment.paid_amount > 0 ? 'Доплатить' : 'Оплатить'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pay Modal */}
            {showPayModal && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Banknote className="h-5 w-5" />
                                {selectedPayment.paid_amount > 0 ? 'Доплата' : 'Оплата'} платежа
                            </CardTitle>
                            <CardDescription>
                                {selectedPayment.contract?.tenant?.full_name} — {selectedPayment.contract?.space?.code}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Начислено:</span>
                                    <p className="font-medium">{selectedPayment.charged_amount.toLocaleString('ru-RU')} сом</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Уже оплачено:</span>
                                    <p className="font-medium">{selectedPayment.paid_amount.toLocaleString('ru-RU')} сом</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Остаток:</span>
                                    <p className="font-bold text-lg text-red-600">
                                        {(selectedPayment.charged_amount - selectedPayment.paid_amount).toLocaleString('ru-RU')} сом
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payAmount">Сумма оплаты (сом)</Label>
                                <Input
                                    type="number"
                                    id="payAmount"
                                    placeholder="Введите сумму"
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    max={selectedPayment.charged_amount - selectedPayment.paid_amount}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Если сумма меньше остатка — будет частичная оплата
                                </p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowPayModal(false);
                                        setSelectedPayment(null);
                                    }}
                                    disabled={isProcessing}
                                >
                                    Отмена
                                </Button>
                                <Button onClick={handlePay} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Подтвердить оплату
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
