'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Trash2, Ban } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CONTRACT_STATUSES, STATUS_COLORS } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Contract {
    id: string;
    start_date: string;
    end_date?: string;
    monthly_rent: number;
    deposit_amount?: number;
    payment_day?: number;
    status: string;
    rate_per_sqm: number;
    tenant: {
        id: string;
        full_name: string;
        phone: string;
    };
    space: {
        id: string;
        code: string;
        type: string;
        area_sqm: number;
    };
    payments: any[];
}

export default function ContractDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [contract, setContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTerminating, setIsTerminating] = useState(false);
    const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        monthly_rent: '',
        payment_day: '',
        status: '',
        end_date: ''
    });

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const response = await fetch(`${API_URL}/api/contracts/${params.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to fetch contract');
                }

                const data = result.data;
                setContract(data);
                setFormData({
                    monthly_rent: data.monthly_rent.toString(),
                    payment_day: data.payment_day?.toString() || '',
                    status: data.status,
                    end_date: data.end_date || ''
                });
            } catch (error) {
                console.error('Error fetching contract:', error);
                toast.error('Ошибка загрузки договора');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchContract();
        }
    }, [params.id]);

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/contracts/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    monthly_rent: parseFloat(formData.monthly_rent),
                    payment_day: formData.payment_day ? parseInt(formData.payment_day) : null,
                    end_date: formData.end_date || null,
                    status: formData.status
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Договор обновлен');
            router.refresh();
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Ошибка обновления договора');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTerminate = async () => {
        setIsTerminating(true);
        try {
            const token = localStorage.getItem('token');
            // Instead of deleting, typically we terminate. But if we want to delete:
            // For now, let's implement termination by setting status to 'terminated' and end_date to today
            const today = new Date().toISOString().split('T')[0];

            const response = await fetch(`${API_URL}/api/contracts/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'terminated',
                    end_date: today
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Договор расторгнут. Место освобождено.');
            setTerminateDialogOpen(false);
            // Redirect to tenants page
            router.push('/owner/tenants');
            router.refresh();
        } catch (error) {
            console.error('Termination error:', error);
            toast.error('Ошибка расторжения договора');
        } finally {
            setIsTerminating(false);
        }
    };

    const handleDelete = async () => {
        if (contract?.status === 'active') {
            toast.error('Сначала расторгните договор, затем удалите');
            setDeleteDialogOpen(false);
            return;
        }

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/contracts/${params.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Договор удалён');
            setDeleteDialogOpen(false);
            router.push('/owner/contracts');
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Ошибка удаления договора');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-lg text-muted-foreground">Договор не найден</p>
                <Link href="/owner/contracts">
                    <Button variant="outline">Назад к списку</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/owner/contracts">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">Договор №{contract.id.slice(0, 8)}</h1>
                        <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS]}>
                            {CONTRACT_STATUSES[contract.status as keyof typeof CONTRACT_STATUSES]}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        {contract.tenant.full_name} • {contract.space.code}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    {/* Main Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Параметры договора</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Дата начала</Label>
                                    <div className="font-medium p-2 bg-slate-100 dark:bg-slate-800 rounded">
                                        {new Date(contract.start_date).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Дата окончания</Label>
                                    <Input
                                        type="date"
                                        id="end_date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rent">Аренда (сом/мес)</Label>
                                    <Input
                                        type="number"
                                        id="rent"
                                        value={formData.monthly_rent}
                                        onChange={(e) => setFormData(prev => ({ ...prev, monthly_rent: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Расчет: {contract.space.area_sqm} м² × {contract.rate_per_sqm} сом
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="payment_day">День оплаты</Label>
                                    <Input
                                        type="number"
                                        id="payment_day"
                                        min="1" max="31"
                                        value={formData.payment_day}
                                        onChange={(e) => setFormData(prev => ({ ...prev, payment_day: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Статус</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Активный</SelectItem>
                                        <SelectItem value="expired">Истёк</SelectItem>
                                        <SelectItem value="terminated">Расторгнут</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Dialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" disabled={contract.status !== 'active'}>
                                        <Ban className="mr-2 h-4 w-4" />
                                        Расторгнуть
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Расторжение договора</DialogTitle>
                                        <DialogDescription>
                                            Вы уверены? Статус договора изменится на "Расторгнут", а торговое место станет свободным. Дата окончания будет установлена на сегодня.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setTerminateDialogOpen(false)}>Отмена</Button>
                                        <Button variant="destructive" onClick={handleTerminate} disabled={isTerminating}>
                                            {isTerminating ? <Loader2 className="animate-spin h-4 w-4" /> : 'Подтвердить расторжение'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Удалить
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Удаление договора</DialogTitle>
                                        <DialogDescription>
                                            {contract.status === 'active' ? (
                                                <span className="text-red-500 font-medium">
                                                    ⚠️ Нельзя удалить активный договор. Сначала расторгните его.
                                                </span>
                                            ) : (
                                                'Вы уверены? Это действие нельзя отменить. Все данные договора будут удалены.'
                                            )}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={isDeleting || contract.status === 'active'}
                                        >
                                            {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Удалить навсегда'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button onClick={handleUpdate} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Сохранить</>}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Related Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Торговое место</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold mb-1">{contract.space.code}</div>
                                <div className="text-sm text-muted-foreground">{contract.space.area_sqm} м², {contract.space.type}</div>
                                <Link href={`/owner/spaces/${contract.space.id}`}>
                                    <Button variant="link" className="p-0 h-auto mt-2">Перейти к месту</Button>
                                </Link>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Арендатор</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="font-medium mb-1">{contract.tenant.full_name}</div>
                                <div className="text-sm text-muted-foreground">{contract.tenant.phone}</div>
                                <Link href={`/owner/tenants/${contract.tenant.id}`}>
                                    <Button variant="link" className="p-0 h-auto mt-2">Перейти к арендатору</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Payments History */}
                <div className="space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>История платежей</CardTitle>
                            <CardDescription>Последние платежи по договору</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {contract.payments && contract.payments.length > 0 ? (
                                <div className="space-y-4">
                                    {contract.payments.map(payment => (
                                        <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">
                                                    {new Date(payment.period_month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(payment.created_at).toLocaleDateString('ru-RU')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{payment.paid_amount > 0 ? payment.paid_amount : 0} с</div>
                                                <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                                                    {payment.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-10">
                                    История платежей пуста
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
