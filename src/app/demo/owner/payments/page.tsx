'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Mock data
const mockPayments = [
    { id: '1', tenant: 'ИП Иванов А.А.', space: 'A-01', period: 'Январь 2024', amount: 45000, status: 'paid', date: '2024-01-20' },
    { id: '2', tenant: 'ООО Ромашка', space: 'A-03', period: 'Январь 2024', amount: 78000, status: 'pending', date: null },
    { id: '3', tenant: 'ИП Сидоров Б.В.', space: 'B-02', period: 'Январь 2024', amount: 32000, status: 'overdue', date: null },
    { id: '4', tenant: 'ООО ТехМаркет', space: 'C-01', period: 'Январь 2024', amount: 92000, status: 'paid', date: '2024-01-18' },
    { id: '5', tenant: 'ИП Козлова А.П.', space: 'B-05', period: 'Январь 2024', amount: 55000, status: 'pending', date: null },
];

const STATUS_LABELS: Record<string, string> = {
    paid: 'Оплачено',
    pending: 'Ожидает',
    overdue: 'Просрочено',
};

const STATUS_COLORS: Record<string, string> = {
    paid: 'bg-green-500',
    pending: 'bg-yellow-500',
    overdue: 'bg-red-500',
};

export default function DemoPaymentsPage() {
    const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<typeof mockPayments[0] | null>(null);

    // Format number to avoid hydration errors
    const formatAmount = (amount: number) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const stats = {
        paid: mockPayments.filter(p => p.status === 'paid').length,
        pending: mockPayments.filter(p => p.status === 'pending').length,
        overdue: mockPayments.filter(p => p.status === 'overdue').length,
        total: mockPayments.reduce((sum, p) => sum + p.amount, 0),
    };

    const handleConfirmPayment = (payment: typeof mockPayments[0]) => {
        setSelectedPayment(payment);
        setConfirmPaymentOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Back button */}
                <Link href="/demo/owner" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Назад к обзору
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Платежи</h1>
                        <p className="text-slate-400">Контроль оплаты аренды</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <CardTitle className="text-sm font-medium text-slate-400">Оплачено</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">{stats.paid}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-yellow-400" />
                                <CardTitle className="text-sm font-medium text-slate-400">Ожидает</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <CardTitle className="text-sm font-medium text-slate-400">Просрочено</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Всего за месяц</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{formatAmount(stats.total)} ₸</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Список платежей</CardTitle>
                        <CardDescription className="text-slate-400">
                            Январь 2024
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-slate-700/50 rounded-lg font-medium text-sm text-slate-300">
                                <div>Арендатор</div>
                                <div>Место</div>
                                <div>Период</div>
                                <div>Сумма</div>
                                <div>Статус</div>
                                <div>Действия</div>
                            </div>
                            {/* Table Body */}
                            {mockPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border border-slate-700 rounded-lg hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="font-medium text-white">{payment.tenant}</div>
                                    <div className="text-slate-400">{payment.space}</div>
                                    <div className="text-slate-400">{payment.period}</div>
                                    <div className="text-white font-medium">{formatAmount(payment.amount)} ₸</div>
                                    <div>
                                        <Badge className={STATUS_COLORS[payment.status]}>
                                            {STATUS_LABELS[payment.status]}
                                        </Badge>
                                    </div>
                                    <div>
                                        {payment.status !== 'paid' && (
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleConfirmPayment(payment)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Отметить
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal: Подтверждение оплаты */}
            <Dialog open={confirmPaymentOpen} onOpenChange={setConfirmPaymentOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Подтверждение оплаты</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Отметить платеж как оплаченный
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="grid gap-4 py-4">
                            <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Арендатор:</span>
                                    <span className="text-white font-medium">{selectedPayment.tenant}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Место:</span>
                                    <span className="text-white">{selectedPayment.space}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Период:</span>
                                    <span className="text-white">{selectedPayment.period}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-600 pt-2">
                                    <span className="text-slate-400">Сумма:</span>
                                    <span className="text-white font-bold">{formatAmount(selectedPayment.amount)} ₸</span>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payment-date">Дата оплаты *</Label>
                                <Input
                                    id="payment-date"
                                    type="date"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="bg-slate-700 border-slate-600"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payment-method">Способ оплаты *</Label>
                                <Select>
                                    <SelectTrigger className="bg-slate-700 border-slate-600">
                                        <SelectValue placeholder="Выберите способ" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="cash">Наличные</SelectItem>
                                        <SelectItem value="card">Банковская карта</SelectItem>
                                        <SelectItem value="transfer">Банковский перевод</SelectItem>
                                        <SelectItem value="kaspi">Kaspi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payment-receipt">Номер квитанции/чека</Label>
                                <Input
                                    id="payment-receipt"
                                    placeholder="№123456"
                                    className="bg-slate-700 border-slate-600"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmPaymentOpen(false)} className="border-slate-600">
                            Отмена
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                            alert('Платеж подтвержден! (демо)');
                            setConfirmPaymentOpen(false);
                        }}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Подтвердить оплату
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
