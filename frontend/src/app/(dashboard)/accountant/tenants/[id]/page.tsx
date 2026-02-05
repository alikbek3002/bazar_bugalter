'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Phone, Mail, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
            space_type: string;
        };
    }[];
}

export default function AccountantTenantDetailsPage() {
    const params = useParams();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

                setTenant(result.data);
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
                <Link href="/accountant/tenants">
                    <Button variant="outline">Назад к списку</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/accountant/tenants">
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
                {/* Контактная информация */}
                <Card>
                    <CardHeader>
                        <CardTitle>Контактная информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> Телефон
                                </p>
                                <p className="font-medium">{tenant.phone}</p>
                            </div>
                            {tenant.email && (
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> Email
                                    </p>
                                    <p className="font-medium">{tenant.email}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {tenant.company_name && (
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Building2 className="h-3 w-3" /> Компания
                                    </p>
                                    <p className="font-medium">{tenant.company_name}</p>
                                </div>
                            )}
                            {tenant.inn_idn && (
                                <div>
                                    <p className="text-sm text-muted-foreground">ИНН</p>
                                    <p className="font-medium">{tenant.inn_idn}</p>
                                </div>
                            )}
                        </div>

                        {tenant.address && (
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Адрес
                                </p>
                                <p className="font-medium">{tenant.address}</p>
                            </div>
                        )}

                        {tenant.notes && (
                            <div>
                                <p className="text-sm text-muted-foreground">Примечания</p>
                                <p className="font-medium">{tenant.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Список договоров */}
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
                                                <div className="text-sm text-muted-foreground">{contract.space?.space_type}</div>
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
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                У арендатора нет договоров
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
