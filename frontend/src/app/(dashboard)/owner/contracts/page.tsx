'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CONTRACT_STATUSES, STATUS_COLORS } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Contract {
    id: string;
    start_date: string;
    end_date?: string;
    monthly_rent: number;
    status: string;
    tenant?: {
        full_name: string;
        phone: string;
    };
    space?: {
        code: string;
        sector?: string;
    };
}

export default function OwnerContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const response = await fetch(`${API_URL}/api/contracts`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to fetch contracts');
                }

                setContracts(result.data);
            } catch (error) {
                console.error('Error fetching contracts:', error);
                toast.error('Ошибка загрузки договоров');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContracts();
    }, []);

    const activeContracts = contracts.filter(c => c.status === 'active');
    const expiredContracts = contracts.filter(c => c.status === 'expired');

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
                    <h1 className="text-3xl font-bold">Договоры</h1>
                    <p className="text-muted-foreground">Управление договорами аренды</p>
                </div>
                <Link href="/owner/contracts/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Новый договор
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Всего договоров</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{contracts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Активные</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeContracts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Истёкшие</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-500">{expiredContracts.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Список договоров</CardTitle>
                    <CardDescription>
                        {contracts.length} договоров
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {contracts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Договоры не найдены</p>
                            <p className="text-sm mb-4">Создайте первый договор</p>
                            <Link href="/owner/contracts/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Новый договор
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium text-sm">
                                <div>Арендатор</div>
                                <div>Место</div>
                                <div>Период</div>
                                <div>Аренда/мес</div>
                                <div>Статус</div>
                                <div>Действия</div>
                            </div>
                            {/* Table Body */}
                            {contracts.map((contract) => (
                                <div
                                    key={contract.id}
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="font-medium">{contract.tenant?.full_name || 'Не указан'}</div>
                                    <div className="text-muted-foreground">{contract.space?.code || 'Не указано'}</div>
                                    <div className="text-muted-foreground text-sm">
                                        {new Date(contract.start_date).toLocaleDateString('ru-RU')}
                                        {contract.end_date && ` — ${new Date(contract.end_date).toLocaleDateString('ru-RU')}`}
                                    </div>
                                    <div className="font-medium">{contract.monthly_rent.toLocaleString('ru-RU')} с</div>
                                    <div>
                                        <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS]}>
                                            {CONTRACT_STATUSES[contract.status as keyof typeof CONTRACT_STATUSES]}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Link href={`/owner/contracts/${contract.id}`}>
                                            <Button variant="ghost" size="sm">Открыть</Button>
                                        </Link>
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
