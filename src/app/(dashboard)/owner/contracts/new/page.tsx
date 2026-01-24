'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import type { Tenant, MarketSpace } from '@/types/database';

export default function NewContractPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [spaces, setSpaces] = useState<MarketSpace[]>([]);

    const [formData, setFormData] = useState({
        tenant_id: '',
        space_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        rate_per_sqm: '',
        monthly_rent: '',
        deposit_amount: '',
        payment_day: '5',
    });

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();

            const [tenantsRes, spacesRes] = await Promise.all([
                supabase.from('tenants').select('*').order('full_name'),
                supabase.from('market_spaces').select('*').eq('status', 'vacant').order('code'),
            ]);

            setTenants(tenantsRes.data || []);
            setSpaces(spacesRes.data || []);
        }
        loadData();
    }, []);

    // Auto-calculate monthly rent when space or rate changes
    useEffect(() => {
        if (formData.space_id && formData.rate_per_sqm) {
            const space = spaces.find(s => s.id === formData.space_id);
            if (space?.area_sqm) {
                const rent = space.area_sqm * parseFloat(formData.rate_per_sqm);
                setFormData(prev => ({ ...prev, monthly_rent: Math.round(rent).toString() }));
            }
        }
    }, [formData.space_id, formData.rate_per_sqm, spaces]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.tenant_id || !formData.space_id || !formData.start_date || !formData.rate_per_sqm || !formData.monthly_rent) {
            toast.error('Заполните все обязательные поля');
            return;
        }

        setIsLoading(true);
        try {
            const supabase = createClient();

            const { error: contractError } = await supabase
                .from('lease_contracts')
                .insert({
                    tenant_id: formData.tenant_id,
                    space_id: formData.space_id,
                    start_date: formData.start_date,
                    end_date: formData.end_date || null,
                    rate_per_sqm: parseFloat(formData.rate_per_sqm),
                    monthly_rent: parseFloat(formData.monthly_rent),
                    deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
                    payment_day: formData.payment_day ? parseInt(formData.payment_day) : null,
                    status: 'active',
                });

            if (contractError) {
                if (contractError.code === '23505') {
                    toast.error('Ошибка', { description: 'На это место уже есть активный договор' });
                } else {
                    toast.error('Ошибка', { description: contractError.message });
                }
                return;
            }

            // Update space status to occupied
            await supabase
                .from('market_spaces')
                .update({ status: 'occupied' })
                .eq('id', formData.space_id);

            toast.success('Договор создан');
            router.push('/owner/contracts');
            router.refresh();
        } catch {
            toast.error('Произошла ошибка');
        } finally {
            setIsLoading(false);
        }
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
                    <h1 className="text-3xl font-bold">Новый договор</h1>
                    <p className="text-muted-foreground">Создание договора аренды</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Информация о договоре</CardTitle>
                    <CardDescription>Заполните параметры аренды</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tenant">Арендатор *</Label>
                                <Select
                                    value={formData.tenant_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, tenant_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите арендатора" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenants.map((tenant) => (
                                            <SelectItem key={tenant.id} value={tenant.id}>
                                                {tenant.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="space">Торговое место *</Label>
                                <Select
                                    value={formData.space_id}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, space_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите место" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {spaces.map((space) => (
                                            <SelectItem key={space.id} value={space.id}>
                                                {space.code} {space.area_sqm && `(${space.area_sqm} м²)`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Показаны только свободные места</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Дата начала *</Label>
                                <Input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">Дата окончания</Label>
                                <Input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rate">Ставка за м² *</Label>
                                <Input
                                    type="number"
                                    placeholder="5000"
                                    value={formData.rate_per_sqm}
                                    onChange={(e) => setFormData(prev => ({ ...prev, rate_per_sqm: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rent">Аренда в месяц *</Label>
                                <Input
                                    type="number"
                                    placeholder="75000"
                                    value={formData.monthly_rent}
                                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_rent: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">Авто = площадь × ставка</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deposit">Депозит</Label>
                                <Input
                                    type="number"
                                    placeholder="75000"
                                    value={formData.deposit_amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, deposit_amount: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment_day">День оплаты</Label>
                            <Input
                                type="number"
                                min={1}
                                max={31}
                                placeholder="5"
                                value={formData.payment_day}
                                onChange={(e) => setFormData(prev => ({ ...prev, payment_day: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">День месяца для ежемесячного платежа</p>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Сохранение...
                                    </>
                                ) : (
                                    'Создать договор'
                                )}
                            </Button>
                            <Link href="/owner/contracts">
                                <Button type="button" variant="outline">Отмена</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
