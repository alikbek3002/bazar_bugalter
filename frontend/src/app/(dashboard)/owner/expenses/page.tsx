'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MinusCircle, Loader2, Plus, Trash2, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const EXPENSE_CATEGORIES: Record<string, string> = {
    utilities: 'Коммуналка',
    salary: 'Зарплата',
    repair: 'Ремонт',
    supplies: 'Хоз. товары',
    transport: 'Транспорт',
    taxes: 'Налоги',
    other: 'Прочее',
};

const CATEGORY_COLORS: Record<string, string> = {
    utilities: 'bg-blue-100 text-blue-800',
    salary: 'bg-purple-100 text-purple-800',
    repair: 'bg-orange-100 text-orange-800',
    supplies: 'bg-teal-100 text-teal-800',
    transport: 'bg-indigo-100 text-indigo-800',
    taxes: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800',
};

interface Expense {
    id: string;
    category: string;
    amount: number;
    description?: string;
    expense_date: string;
    created_by_profile?: {
        full_name: string;
    };
    created_at: string;
}

export default function OwnerExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchExpenses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_URL}/api/expenses?limit=200`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to fetch expenses');
            }

            setExpenses(result.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Ошибка загрузки расходов');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить этот расход?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/expenses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Расход удалён');
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Ошибка удаления');
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group by category for summary
    const byCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

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
                    <h1 className="text-3xl font-bold">Расходы</h1>
                    <p className="text-muted-foreground">Учёт расходов по рынку</p>
                </div>
                <Link href="/owner/expenses/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить расход
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Всего расходов</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {totalExpenses.toLocaleString('ru-RU')} сом
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {expenses.length} записей
                        </p>
                    </CardContent>
                </Card>

                {Object.entries(byCategory).slice(0, 2).map(([cat, amount]) => (
                    <Card key={cat}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                {EXPENSE_CATEGORIES[cat] || cat}
                            </CardTitle>
                            <MinusCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {amount.toLocaleString('ru-RU')} сом
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Expenses List */}
            <Card>
                <CardHeader>
                    <CardTitle>Список расходов</CardTitle>
                    <CardDescription>
                        Последние {expenses.length} записей
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {expenses.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <MinusCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Расходов нет</p>
                            <p className="text-sm mb-4">Добавьте первый расход</p>
                            <Link href="/owner/expenses/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Добавить расход
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium text-sm">
                                <div>Дата</div>
                                <div>Категория</div>
                                <div>Описание</div>
                                <div>Сумма</div>
                                <div>Добавил</div>
                                <div>Действия</div>
                            </div>
                            {/* Table Body */}
                            {expenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="text-muted-foreground">
                                        {new Date(expense.expense_date).toLocaleDateString('ru-RU')}
                                    </div>
                                    <div>
                                        <Badge className={CATEGORY_COLORS[expense.category] || 'bg-gray-100 text-gray-800'}>
                                            {EXPENSE_CATEGORIES[expense.category] || expense.category}
                                        </Badge>
                                    </div>
                                    <div className="text-muted-foreground truncate">
                                        {expense.description || '—'}
                                    </div>
                                    <div className="font-medium text-red-600">
                                        -{expense.amount.toLocaleString('ru-RU')} сом
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {expense.created_by_profile?.full_name || '—'}
                                    </div>
                                    <div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(expense.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
