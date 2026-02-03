'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SPACE_TYPES, SPACE_STATUSES, STATUS_COLORS } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MarketSpace {
    id: string;
    code: string;
    sector?: string;
    status: string;
    space_type?: string;
    area_sqm?: number;
}

export default function OwnerSpacesPage() {
    const [spaces, setSpaces] = useState<MarketSpace[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const response = await fetch(`${API_URL}/api/spaces`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to fetch spaces');
                }

                setSpaces(result.data);
            } catch (error) {
                console.error('Error fetching spaces:', error);
                toast.error('Ошибка загрузки торговых мест');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSpaces();
    }, []);

    // Группируем по секторам
    const sectors = [...new Set(spaces.map(s => s.sector).filter(Boolean))];

    const stats = {
        total: spaces.length,
        occupied: spaces.filter(s => s.status === 'occupied').length,
        vacant: spaces.filter(s => s.status === 'vacant').length,
        maintenance: spaces.filter(s => s.status === 'maintenance').length,
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
                    <h1 className="text-3xl font-bold">Торговые места</h1>
                    <p className="text-muted-foreground">Управление торговыми местами рынка</p>
                </div>
                <Link href="/owner/spaces/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить место
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Всего мест</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">Занято</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Свободно</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.vacant}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-600">Обслуживание</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Spaces List */}
            <Card>
                <CardHeader>
                    <CardTitle>Список торговых мест</CardTitle>
                    <CardDescription>
                        {spaces.length} мест в {sectors.length} секторах
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {spaces.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <MapPin className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Торговые места не найдены</p>
                            <p className="text-sm mb-4">Добавьте первое торговое место</p>
                            <Link href="/owner/spaces/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Добавить место
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium text-sm">
                                <div>Код</div>
                                <div>Сектор</div>
                                <div>Тип</div>
                                <div>Площадь</div>
                                <div>Статус</div>
                                <div>Действия</div>
                            </div>
                            {/* Table Body */}
                            {spaces.map((space) => (
                                <div
                                    key={space.id}
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="font-medium">{space.code}</div>
                                    <div className="text-muted-foreground">{space.sector || '—'}</div>
                                    <div className="text-muted-foreground">
                                        {space.space_type ? SPACE_TYPES[space.space_type as keyof typeof SPACE_TYPES] : '—'}
                                    </div>
                                    <div className="text-muted-foreground">
                                        {space.area_sqm ? `${space.area_sqm} м²` : '—'}
                                    </div>
                                    <div>
                                        <Badge className={STATUS_COLORS[space.status as keyof typeof STATUS_COLORS]}>
                                            {SPACE_STATUSES[space.status as keyof typeof SPACE_STATUSES]}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Link href={`/owner/spaces/${space.id}`}>
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
