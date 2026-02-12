'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface OccupiedSpace {
    id: string;
    code: string;
    space_type: string;
    contract: {
        id: string;
        monthly_rent: number;
        tenant: {
            id: string;
            full_name: string;
            phone: string;
        };
    };
}

export default function NewPaymentPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [occupiedSpaces, setOccupiedSpaces] = useState<OccupiedSpace[]>([]);
    const [spaceOpen, setSpaceOpen] = useState(false);

    const [formData, setFormData] = useState({
        space_id: '',
        paid_amount: '',
        period_start: '',
        period_end: '',
        payment_method: 'cash',
        notes: ''
    });

    const [selectedSpace, setSelectedSpace] = useState<OccupiedSpace | null>(null);

    useEffect(() => {
        const fetchOccupiedSpaces = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                // Fetch spaces with their active contracts
                const response = await fetch(`${API_URL}/api/spaces?status=occupied`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error);

                // Transform data to include contract info
                const spacesWithContracts: OccupiedSpace[] = [];

                for (const space of result.data || []) {
                    if (space.contracts?.length > 0) {
                        const activeContract = space.contracts.find((c: any) => c.status === 'active');
                        if (activeContract && activeContract.tenant) {
                            spacesWithContracts.push({
                                id: space.id,
                                code: space.code,
                                space_type: space.space_type,
                                contract: {
                                    id: activeContract.id,
                                    monthly_rent: activeContract.monthly_rent,
                                    tenant: activeContract.tenant
                                }
                            });
                        }
                    }
                }

                setOccupiedSpaces(spacesWithContracts);
            } catch (error) {
                console.error('Error fetching spaces:', error);
                toast.error('Ошибка загрузки занятых мест');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOccupiedSpaces();
    }, []);

    const handleSpaceSelect = (spaceId: string) => {
        const space = occupiedSpaces.find(s => s.id === spaceId);
        setSelectedSpace(space || null);
        setFormData(prev => ({ ...prev, space_id: spaceId }));
        setSpaceOpen(false);
    };

    const calculateChargedAmount = () => {
        if (!selectedSpace || !formData.period_start || !formData.period_end) return 0;
        const start = new Date(formData.period_start);
        const end = new Date(formData.period_end);
        const months = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000)));
        return selectedSpace.contract.monthly_rent * months;
    };

    const handleSubmit = async () => {
        if (!formData.space_id || !formData.paid_amount || !formData.period_start || !formData.period_end) {
            toast.error('Заполните все обязательные поля');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Платёж добавлен');
            router.push('/owner/payments');
        } catch (error: any) {
            console.error('Create payment error:', error);
            toast.error(error.message || 'Ошибка создания платежа');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const chargedAmount = calculateChargedAmount();

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/owner/payments">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Добавить платёж</h1>
                    <p className="text-muted-foreground">Регистрация оплаты за аренду</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Данные платежа
                    </CardTitle>
                    <CardDescription>
                        Выберите место и укажите период оплаты
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Space Selection */}
                    <div className="space-y-2">
                        <Label>Торговое место *</Label>
                        <Popover open={spaceOpen} onOpenChange={setSpaceOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                >
                                    {selectedSpace
                                        ? `${selectedSpace.code} — ${selectedSpace.contract.tenant.full_name}`
                                        : 'Выберите занятое место...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Поиск места..." />
                                    <CommandList>
                                        <CommandEmpty>Занятых мест не найдено</CommandEmpty>
                                        <CommandGroup>
                                            {occupiedSpaces.map((space) => (
                                                <CommandItem
                                                    key={space.id}
                                                    value={`${space.code} ${space.contract.tenant.full_name}`}
                                                    onSelect={() => handleSpaceSelect(space.id)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.space_id === space.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div>
                                                        <div className="font-medium">{space.code}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {space.contract.tenant.full_name} • {space.contract.monthly_rent.toLocaleString()} с/мес
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Tenant Info (auto-filled) */}
                    {selectedSpace && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="text-sm text-muted-foreground mb-1">Арендатор</div>
                            <div className="font-medium">{selectedSpace.contract.tenant.full_name}</div>
                            <div className="text-sm text-muted-foreground">{selectedSpace.contract.tenant.phone}</div>
                            <div className="mt-2 text-sm">
                                Аренда: <span className="font-medium">{selectedSpace.contract.monthly_rent.toLocaleString()} с/мес</span>
                            </div>
                        </div>
                    )}

                    {/* Period */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="period_start">Период с *</Label>
                            <Input
                                type="date"
                                id="period_start"
                                value={formData.period_start}
                                onChange={(e) => setFormData(prev => ({ ...prev, period_start: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="period_end">Период по *</Label>
                            <Input
                                type="date"
                                id="period_end"
                                value={formData.period_end}
                                onChange={(e) => setFormData(prev => ({ ...prev, period_end: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Calculated amount */}
                    {chargedAmount > 0 && (
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <div className="text-sm text-muted-foreground">К оплате за период</div>
                            <div className="text-2xl font-bold">{chargedAmount.toLocaleString()} сом</div>
                        </div>
                    )}

                    {/* Paid Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="paid_amount">Оплаченная сумма *</Label>
                        <Input
                            type="number"
                            id="paid_amount"
                            placeholder="Введите сумму"
                            value={formData.paid_amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, paid_amount: e.target.value }))}
                        />
                        {chargedAmount > 0 && formData.paid_amount && parseFloat(formData.paid_amount) < chargedAmount && (
                            <p className="text-sm text-orange-500">
                                Частичная оплата ({Math.round(parseFloat(formData.paid_amount) / chargedAmount * 100)}%)
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Примечание</Label>
                        <Textarea
                            id="notes"
                            placeholder="Дополнительная информация..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Link href="/owner/payments">
                        <Button variant="outline">Отмена</Button>
                    </Link>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Сохранить платёж'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
