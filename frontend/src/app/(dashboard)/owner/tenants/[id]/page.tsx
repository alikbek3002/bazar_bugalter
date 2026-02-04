'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Phone, Mail, MapPin, Building2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CONTRACT_STATUSES, STATUS_COLORS } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Tenant {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
    inn_idn?: string;
    company_name?: string;
    address?: string;
    notes?: string;
    contracts: {
        id: string;
        status: string;
        monthly_rent: number;
        start_date: string;
        end_date?: string;
        space: {
            code: string;
            type: string;
        };
    }[];
}

export default function TenantDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        company_name: '',
        inn_idn: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const response = await fetch(`${API_URL}/api/tenants/${params.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to fetch tenant');
                }

                const data = result.data;
                setTenant(data);
                setFormData({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    company_name: data.company_name || '',
                    inn_idn: data.inn_idn || '', // DB field name
                    address: data.address || '',
                    notes: data.notes || ''
                });
            } catch (error) {
                console.error('Error fetching tenant:', error);
                toast.error('Ошибка загрузки арендатора');
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchTenant();
        }
    }, [params.id]);

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/tenants/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Данные арендатора обновлены');
            router.refresh();
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Ошибка обновления данных');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-lg text-muted-foreground">Арендатор не найден</p>
                <Link href="/owner/tenants">
                    <Button variant="outline">Назад к списку</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/owner/tenants">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{tenant.full_name}</h1>
                    <p className="text-muted-foreground">
                        {tenant.company_name || 'Частное лицо'} • {tenant.phone}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    {/* Main Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Контактная информация</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">ФИО</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Телефон</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            className="pl-9"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            className="pl-9"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Компания</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="company"
                                            className="pl-9"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="inn">ИНН</Label>
                                    <Input
                                        id="inn"
                                        value={formData.inn_idn}
                                        onChange={(e) => setFormData(prev => ({ ...prev, inn_idn: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Адрес</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        className="pl-9"
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Примечания</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={handleUpdate} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Сохранить</>}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Contracts History */}
                <div className="space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Список договоров</CardTitle>
                            <CardDescription>Активные и завершенные договоры</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tenant.contracts && tenant.contracts.length > 0 ? (
                                <div className="space-y-4">
                                    {tenant.contracts.map(contract => (
                                        <div key={contract.id} className="flex flex-col p-4 border rounded-lg gap-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-lg">{contract.space?.code || 'Место удалено'}</div>
                                                    <div className="text-sm text-muted-foreground">{contract.space?.type}</div>
                                                </div>
                                                <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS]}>
                                                    {CONTRACT_STATUSES[contract.status as keyof typeof CONTRACT_STATUSES]}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 text-sm gap-y-1 mt-2">
                                                <span className="text-muted-foreground">Начало:</span>
                                                <span>{new Date(contract.start_date).toLocaleDateString('ru-RU')}</span>

                                                {contract.end_date && (
                                                    <>
                                                        <span className="text-muted-foreground">Конец:</span>
                                                        <span>{new Date(contract.end_date).toLocaleDateString('ru-RU')}</span>
                                                    </>
                                                )}

                                                <span className="text-muted-foreground">Аренда:</span>
                                                <span className="font-medium">{contract.monthly_rent?.toLocaleString('ru-RU')} с</span>
                                            </div>

                                            <Link href={`/owner/contracts/${contract.id}`} className="mt-2 text-sm text-blue-500 hover:underline">
                                                Перейти к договору →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-10">
                                    У арендатора нет договоров
                                    <div className="mt-4">
                                        <Link href="/owner/contracts/new">
                                            <Button variant="outline" size="sm">Создать договор</Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
