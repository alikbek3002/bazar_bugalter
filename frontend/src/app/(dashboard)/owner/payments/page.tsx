'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    CreditCard, Loader2, Plus, AlertTriangle, Clock, CheckCircle,
    Banknote, Trash2, ChevronLeft, ChevronRight, Search, ListFilter, CalendarDays, List, Pencil
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

type TabType = 'monthly' | 'all';

const ITEMS_PER_PAGE = 50;

export default function OwnerPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [payAmount, setPayAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Current tab
    const [activeTab, setActiveTab] = useState<TabType>('monthly');

    // Month filter (for "monthly" tab)
    const now = new Date();
    const [filterYear, setFilterYear] = useState(now.getFullYear());
    const [filterMonth, setFilterMonth] = useState(now.getMonth());

    // All payments tab filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [allPage, setAllPage] = useState(1);

    // Status menu
    const [statusMenuPaymentId, setStatusMenuPaymentId] = useState<string | null>(null);

    // Delete confirmation
    const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

    // Edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPayment, setEditPayment] = useState<Payment | null>(null);
    const [editForm, setEditForm] = useState({
        charged_amount: '',
        paid_amount: '',
        payment_method: '',
        notes: ''
    });

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_URL}/api/payments?limit=5000`, {
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

    // ======= Monthly tab: filter by month =======
    const filteredByMonth = payments.filter(p => {
        const dateStr = p.period_month || p.period_start;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
    });

    // ======= All tab: filter by search + status =======
    const filteredAll = useMemo(() => {
        let result = [...payments];

        // Search by tenant name or space code
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.tenant?.full_name || '').toLowerCase().includes(q) ||
                (p.space?.code || p.contract?.space?.code || '').toLowerCase().includes(q) ||
                (p.tenant?.phone || '').toLowerCase().includes(q)
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter);
        }

        // Sort by due_date descending
        result.sort((a, b) => {
            const dateA = a.due_date || a.period_month || a.period_start || '';
            const dateB = b.due_date || b.period_month || b.period_start || '';
            return dateB.localeCompare(dateA);
        });

        return result;
    }, [payments, searchQuery, statusFilter]);

    // Pagination for "all" tab
    const totalAllPages = Math.max(1, Math.ceil(filteredAll.length / ITEMS_PER_PAGE));
    const paginatedAll = filteredAll.slice((allPage - 1) * ITEMS_PER_PAGE, allPage * ITEMS_PER_PAGE);

    // Reset page when filters change
    useEffect(() => {
        setAllPage(1);
    }, [searchQuery, statusFilter]);

    // ======= Navigation (monthly tab) =======
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

    // ======= Payment actions =======
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

    // ======= Edit =======
    const openEditModal = (payment: Payment) => {
        setEditPayment(payment);
        setEditForm({
            charged_amount: payment.charged_amount.toString(),
            paid_amount: payment.paid_amount.toString(),
            payment_method: payment.payment_method || '',
            notes: payment.notes || ''
        });
        setShowEditModal(true);
    };

    const handleEdit = async () => {
        if (!editPayment) return;

        const chargedAmount = parseFloat(editForm.charged_amount);
        const paidAmount = parseFloat(editForm.paid_amount);

        if (isNaN(chargedAmount) || chargedAmount <= 0) {
            toast.error('Введите корректную сумму начисления');
            return;
        }

        if (isNaN(paidAmount) || paidAmount < 0) {
            toast.error('Введите корректную сумму оплаты');
            return;
        }

        if (paidAmount > chargedAmount) {
            toast.error('Оплаченная сумма не может превышать начисленную');
            return;
        }

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/payments/${editPayment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    charged_amount: chargedAmount,
                    paid_amount: paidAmount,
                    payment_method: editForm.payment_method,
                    notes: editForm.notes
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            const newStatus = paidAmount >= chargedAmount ? 'Оплачен' :
                paidAmount > 0 ? 'Частично' : 'без изменений';

            toast.success(`Платёж обновлён${paidAmount >= chargedAmount ? ' • Статус: Оплачен ✓' : ''}`);
            setShowEditModal(false);
            setEditPayment(null);
            await fetchPayments();
        } catch (error: any) {
            console.error('Edit error:', error);
            toast.error(error.message || 'Ошибка редактирования');
        } finally {
            setIsProcessing(false);
        }
    };

    // ======= Stats =======
    const currentPayments = activeTab === 'monthly' ? filteredByMonth : filteredAll;
    const paid = currentPayments.filter(p => p.status === 'paid');
    const pending = currentPayments.filter(p => p.status === 'pending');
    const partial = currentPayments.filter(p => p.status === 'partial');
    const overdue = currentPayments.filter(p => p.status === 'overdue');

    // ======= Render payment row =======
    const renderPaymentRow = (payment: Payment) => {
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
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => openEditModal(payment)}
                        title="Редактировать"
                    >
                        <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeletePaymentId(payment.id)}
                        title="Удалить"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        );
    };

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

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('monthly')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'monthly'
                        ? 'bg-white dark:bg-slate-900 shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <CalendarDays className="h-4 w-4" />
                    По месяцам
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'all'
                        ? 'bg-white dark:bg-slate-900 shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <List className="h-4 w-4" />
                    Все платежи
                    <Badge variant="secondary" className="ml-1 text-xs">{payments.length}</Badge>
                </button>
            </div>

            {/* Monthly tab: Month Filter */}
            {activeTab === 'monthly' && (
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
            )}

            {/* All tab: Search + Status filter */}
            {activeTab === 'all' && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Поиск по имени, месту или телефону..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {[
                            { key: 'all', label: 'Все' },
                            { key: 'paid', label: 'Оплачен' },
                            { key: 'pending', label: 'Ожидает' },
                            { key: 'overdue', label: 'Просрочен' },
                            { key: 'partial', label: 'Частично' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setStatusFilter(key)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === key
                                    ? 'bg-white dark:bg-slate-900 shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Оплачено</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{paid.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {paid.reduce((s, p) => s + p.paid_amount, 0).toLocaleString('ru-RU')} сом
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ожидает</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pending.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {pending.reduce((s, p) => s + p.charged_amount, 0).toLocaleString('ru-RU')} сом
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Частично</CardTitle>
                        <Banknote className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{partial.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {partial.reduce((s, p) => s + (p.charged_amount - p.paid_amount), 0).toLocaleString('ru-RU')} сом остаток
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Просрочено</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{overdue.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {overdue.reduce((s, p) => s + p.charged_amount, 0).toLocaleString('ru-RU')} сом
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payments List */}
            <Card>
                <CardHeader>
                    <CardTitle>Список платежей</CardTitle>
                    <CardDescription>
                        {activeTab === 'monthly'
                            ? `${MONTH_NAMES[filterMonth]} ${filterYear} — всего ${filteredByMonth.length} записей`
                            : `Всего ${filteredAll.length} записей${searchQuery ? ` по запросу "${searchQuery}"` : ''}${statusFilter !== 'all' ? ` • ${STATUS_LABELS[statusFilter]}` : ''}`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {(activeTab === 'monthly' ? filteredByMonth : paginatedAll).length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            {activeTab === 'monthly' ? (
                                <>
                                    <p className="text-lg">Платежей за этот месяц нет</p>
                                    <p className="text-sm mb-4">Создайте платёж или выберите другой месяц</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg">Платежей не найдено</p>
                                    <p className="text-sm mb-4">Попробуйте изменить фильтры или поисковый запрос</p>
                                </>
                            )}
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
                            {(activeTab === 'monthly' ? filteredByMonth : paginatedAll).map(renderPaymentRow)}
                        </div>
                    )}

                    {/* Pagination for "all" tab */}
                    {activeTab === 'all' && totalAllPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Показано {(allPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(allPage * ITEMS_PER_PAGE, filteredAll.length)} из {filteredAll.length}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={allPage <= 1}
                                    onClick={() => setAllPage(allPage - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Назад
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalAllPages, 5) }, (_, i) => {
                                        let page: number;
                                        if (totalAllPages <= 5) {
                                            page = i + 1;
                                        } else if (allPage <= 3) {
                                            page = i + 1;
                                        } else if (allPage >= totalAllPages - 2) {
                                            page = totalAllPages - 4 + i;
                                        } else {
                                            page = allPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setAllPage(page)}
                                                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${allPage === page
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={allPage >= totalAllPages}
                                    onClick={() => setAllPage(allPage + 1)}
                                >
                                    Вперёд
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
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

            {/* Edit Modal */}
            {showEditModal && editPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Pencil className="h-5 w-5" />
                                Редактировать платёж
                            </CardTitle>
                            <CardDescription>
                                {editPayment.tenant?.full_name} — {editPayment.space?.code || editPayment.contract?.space?.code || '—'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="editChargedAmount">Начислено (сом)</Label>
                                    <Input
                                        type="number"
                                        id="editChargedAmount"
                                        placeholder="Сумма начисления"
                                        value={editForm.charged_amount}
                                        onChange={(e) => setEditForm({ ...editForm, charged_amount: e.target.value })}
                                        min={0}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editPaidAmount">Оплачено (сом)</Label>
                                    <Input
                                        type="number"
                                        id="editPaidAmount"
                                        placeholder="Сумма оплаты"
                                        value={editForm.paid_amount}
                                        onChange={(e) => setEditForm({ ...editForm, paid_amount: e.target.value })}
                                        min={0}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editPaymentMethod">Метод оплаты</Label>
                                <Input
                                    id="editPaymentMethod"
                                    placeholder="Наличные, перевод и т.д."
                                    value={editForm.payment_method}
                                    onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editNotes">Заметки</Label>
                                <Input
                                    id="editNotes"
                                    placeholder="Дополнительная информация"
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                />
                            </div>

                            {/* Status preview */}
                            {editForm.charged_amount && editForm.paid_amount && (() => {
                                const charged = parseFloat(editForm.charged_amount);
                                const paid = parseFloat(editForm.paid_amount);
                                if (isNaN(charged) || isNaN(paid)) return null;
                                const willBePaid = paid >= charged && charged > 0;
                                const willBePartial = paid > 0 && paid < charged;
                                return (
                                    <div className={`p-3 rounded-lg text-sm ${willBePaid
                                            ? 'bg-green-50 text-green-800 border border-green-200'
                                            : willBePartial
                                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                                        }`}>
                                        {willBePaid && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                Статус автоматически изменится на <strong>«Оплачен»</strong>
                                            </div>
                                        )}
                                        {willBePartial && (
                                            <div className="flex items-center gap-2">
                                                <Banknote className="h-4 w-4" />
                                                Статус автоматически изменится на <strong>«Частично»</strong>
                                                <span className="ml-auto font-medium">
                                                    Остаток: {(charged - paid).toLocaleString('ru-RU')} сом
                                                </span>
                                            </div>
                                        )}
                                        {!willBePaid && !willBePartial && paid === 0 && (
                                            <div>Статус останется без изменений</div>
                                        )}
                                    </div>
                                );
                            })()}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditPayment(null);
                                    }}
                                    disabled={isProcessing}
                                >
                                    Отмена
                                </Button>
                                <Button onClick={handleEdit} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Сохранить
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
