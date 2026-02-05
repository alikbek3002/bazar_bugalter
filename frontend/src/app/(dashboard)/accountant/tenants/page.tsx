'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Tenant {
    id: string;
    full_name: string;
    phone: string;
    company_name?: string;
    contracts: {
        id: string;
        status: string;
    }[];
}

export default function AccountantTenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const response = await fetch(`${API_URL}/api/tenants`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to fetch tenants');
                }

                setTenants(result.data);
            } catch (error) {
                console.error('Error fetching tenants:', error);
                toast.error('Ошибка загрузки арендаторов');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTenants();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Арендаторы</h1>
                <p className="text-muted-foreground">Просмотр базы данных арендаторов</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Список арендаторов</CardTitle>
                    <CardDescription>
                        Всего {tenants.length} арендаторов
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {tenants.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Арендаторы не найдены</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium text-sm">
                                <div>ФИО</div>
                                <div>Телефон</div>
                                <div>Компания</div>
                                <div>Договоры</div>
                            </div>
                            {/* Table Body */}
                            {tenants.map((tenant) => {
                                const activeContracts = tenant.contracts?.filter((c) => c.status === 'active').length || 0;
                                return (
                                    <Link
                                        key={tenant.id}
                                        href={`/accountant/tenants/${tenant.id}`}
                                        className="grid grid-cols-4 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                    >
                                        <div className="font-medium">{tenant.full_name}</div>
                                        <div className="text-muted-foreground">{tenant.phone}</div>
                                        <div className="text-muted-foreground">{tenant.company_name || '—'}</div>
                                        <div>
                                            {activeContracts > 0 ? (
                                                <Badge className="bg-green-500">{activeContracts} активных</Badge>
                                            ) : (
                                                <Badge variant="secondary">Нет договоров</Badge>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
