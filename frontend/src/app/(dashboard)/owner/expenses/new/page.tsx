'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, MinusCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const EXPENSE_CATEGORIES = [
    { value: 'utilities', label: 'Коммуналка' },
    { value: 'salary', label: 'Зарплата' },
    { value: 'repair', label: 'Ремонт' },
    { value: 'supplies', label: 'Хоз. товары' },
    { value: 'transport', label: 'Транспорт' },
    { value: 'taxes', label: 'Налоги' },
    { value: 'other', label: 'Прочее' },
];

export default function NewExpensePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const handleSubmit = async () => {
        if (!formData.category || !formData.amount) {
            toast.error('Заполните категорию и сумму');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Расход добавлен');
            router.push('/owner/expenses');
        } catch (error: any) {
            console.error('Create expense error:', error);
            toast.error(error.message || 'Ошибка создания расхода');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/owner/expenses">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Добавить расход</h1>
                    <p className="text-muted-foreground">Регистрация нового расхода</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MinusCircle className="h-5 w-5" />
                        Данные расхода
                    </CardTitle>
                    <CardDescription>
                        Укажите категорию, сумму и описание
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Категория *</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите категорию..." />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPENSE_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Сумма (сом) *</Label>
                        <Input
                            type="number"
                            id="amount"
                            placeholder="Введите сумму"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="expense_date">Дата</Label>
                        <Input
                            type="date"
                            id="expense_date"
                            value={formData.expense_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                            id="description"
                            placeholder="Дополнительная информация..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Link href="/owner/expenses">
                        <Button variant="outline">Отмена</Button>
                    </Link>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Сохранить расход'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
