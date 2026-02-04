'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Loader2, LayoutGrid, LayoutList, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { SPACE_TYPES, SPACE_STATUSES, STATUS_COLORS } from '@/lib/constants';
import { MarketSpace } from '@/types/database';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function OwnerSpacesPage() {
    const [spaces, setSpaces] = useState<MarketSpace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg p-1 mr-2">
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode('list')}
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    <Link href="/owner/spaces/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить место
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>

            {/* Spaces Content */}
            {spaces.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Список торговых мест</CardTitle>
                        <CardDescription>0 мест</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
            ) : viewMode === 'list' ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Список торговых мест</CardTitle>
                        <CardDescription>
                            {spaces.length} мест в {sectors.length} секторах
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors items-center"
                                >
                                    <div className="font-medium flex items-center gap-2">
                                        {space.photos && space.photos.length > 0 ? (
                                            <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                <img src={space.photos[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                                                <ImageIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                        {space.code}
                                    </div>
                                    <div className="text-muted-foreground">{space.sector || '—'}</div>
                                    <div className="text-muted-foreground">
                                        {space.space_type ? SPACE_TYPES[space.space_type] : '—'}
                                    </div>
                                    <div className="text-muted-foreground">
                                        {space.area_sqm ? `${space.area_sqm} м²` : '—'}
                                    </div>
                                    <div>
                                        <Badge className={STATUS_COLORS[space.status]}>
                                            {SPACE_STATUSES[space.status]}
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
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {spaces.map((space) => (
                        <Link key={space.id} href={`/owner/spaces/${space.id}`} className="block group">
                            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative">
                                    {space.photos && space.photos.length > 0 ? (
                                        <img
                                            src={space.photos[0]}
                                            alt={space.code}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon className="w-12 h-12 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Badge className={`${STATUS_COLORS[space.status]} shadow-sm`}>
                                            {SPACE_STATUSES[space.status]}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                                        {space.code}
                                    </h3>
                                    <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                                        <span>{space.space_type ? SPACE_TYPES[space.space_type] : 'Место'}</span>
                                        <span>{space.area_sqm ? `${space.area_sqm} м²` : '—'}</span>
                                    </div>
                                    {space.sector && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Сектор: {space.sector}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
