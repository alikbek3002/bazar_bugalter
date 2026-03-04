'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    CreditCard, Loader2, Plus, AlertTriangle, Clock, CheckCircle,
    Banknote, Trash2, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';
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
    period_month?: string;
    payment_method?: string;
    due_date?: string;
    paid_at?: string;
    notes?: string;
    tenant?: {
        id: string;
        full_name: string;
        phone?: string;
    };
    contract?: {
        space?: {
            id: string;
            code: string;
        };
    };
    space?: {
        id: string;
        code: string;
        space_type?: string;
    };
}

const MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export default function OwnerPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [payAmount, setPayAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Month filter
    const now = new Date();
    const [filterYear, setFilterYear] = useState(now.getFullYear());
    const [filterMonth, setFilterMonth] = useState(now.getMonth()); // 0-indexed

    // Status menu
    const [statusMenuPaymentId, setStatusMenuPaymentId] = useState<string | null>(null);

    // Delete confirmation
    const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_URL}/api/payments?limit=500`, {
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

    // Filter payments by selected month
    const filteredPayments = payments.filter(p => {
        const dateStr = p.period_month || p.period_start;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
    });

    const goToPrevMonth = () => {
        if (filterMonth === 0) {
            setFilterMonth(11);
            setFilterYear(filterYear - 1);
        } else {
            setFilterMonth(filterMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (filterMonth === 11) {
            setFilterMonth(0);
            setFilterYear(filterYear + 1);
        } else {
            setFilterMonth(filterMonth + 1);
        }
    };

    const goToCurrentMonth = () => {
        const now = new Date();
        setFilterYear(now.getFullYear());
        setFilterMonth(now.getMonth());
    };

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

    const handleChangeStatus = async (paymentId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/payments/${paymentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success(`Статус изменён на "${STATUS_LABELS[newStatus]}"`);
            setStatusMenuPaymentId(null);
            await fetchPayments();
        } catch (error: any) {
            console.error('Change status error:', error);
            toast.error(error.message || 'Ошибка изменения статуса');
        }
    };

    const handleDelete = async (paymentId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/payments/${paymentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Платёж удалён');
            setDeletePaymentId(null);
            await fetchPayments();
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Ошибка удаления');
        }
    };

    // Stats based on filtered payments
    const paid = filteredPayments.filter(p => p.status === 'paid');
    const pending = filteredPayments.filter(p => p.status === 'pending');
    const partial = filteredPayments.filter(p => p.status === 'partial');
    const overdue = filteredPayments.filter(p => p.status === 'overdue');

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

            {/* Month Filter */}
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-lg font-semibold min-w-[180px] text-center">
                    {MONTH_NAMES[filterMonth]} {filterYear}
                </div>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={goToCurrentMonth}>
                    Текущий месяц
                </Button>
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
                    <CardDescription>
                        {MONTH_NAMES[filterMonth]} {filterYear} — всего {filteredPayments.length} записей
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredPayments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Платежей за этот месяц нет</p>
                            <p className="text-sm mb-4">Создайте платёж или выберите другой месяц</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-8 gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium text-sm">
                                <div>Арендатор</div>
                                <div>Место</div>
                                <div>Срок оплаты</div>
                                <div>Начислено</div>
                                <div>Оплачено</div>
                                <div>Статус</div>
                                <div className="col-span-2">Действия</div>
                            </div>
                            {/* Table Body */}
                            {filteredPayments.map((payment) => {
                                const remaining = payment.charged_amount - payment.paid_amount;
                                const canPay = ['pending', 'partial', 'overdue'].includes(payment.status);
                                const spaceCode = payment.space?.code || payment.contract?.space?.code || '—';

                                return (
                                    <div
                                        key={payment.id}
                                        className="grid grid-cols-8 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="font-medium">
                                            {payment.tenant?.full_name || '—'}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {spaceCode}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {payment.due_date
                                                ? new Date(payment.due_date).toLocaleDateString('ru-RU')
                                                : '—'}
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
                                        <div className="relative">
                                            <Badge
                                                className={`${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'} cursor-pointer`}
                                                onClick={() => setStatusMenuPaymentId(
                                                    statusMenuPaymentId === payment.id ? null : payment.id
                                                )}
                                            >
                                                {STATUS_LABELS[payment.status] || payment.status}
                                            </Badge>
                                            {/* Status dropdown */}
                                            {statusMenuPaymentId === payment.id && (
                                                <div className="absolute z-50 mt-1 bg-white dark:bg-slate-900 border rounded-lg shadow-lg py-1 min-w-[140px] left-0">
                                                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                                        <button
                                                            key={key}
                                                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${payment.status === key ? 'font-bold' : ''}`}
                                                            onClick={() => handleChangeStatus(payment.id, key)}
                                                        >
                                                            <Badge className={`${STATUS_COLORS[key]} mr-2`} >
                                                                {label}
                                                            </Badge>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-2 flex gap-2">
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
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setDeletePaymentId(payment.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Close status menu on outside click */}
            {statusMenuPaymentId && (
                <div className="fixed inset-0 z-40" onClick={() => setStatusMenuPaymentId(null)} />
            )}

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
                                {selectedPayment.tenant?.full_name} — {selectedPayment.space?.code || selectedPayment.contract?.space?.code}
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

            {/* Delete Confirmation Modal */}
            {deletePaymentId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-sm mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <Trash2 className="h-5 w-5" />
                                Удалить платёж?
                            </CardTitle>
                            <CardDescription>
                                Это действие нельзя отменить. Платёж будет удалён безвозвратно.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeletePaymentId(null)}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(deletePaymentId)}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Удалить
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
