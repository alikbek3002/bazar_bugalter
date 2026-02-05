'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin, User, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SPACE_STATUSES, SPACE_TYPES, STATUS_COLORS } from '@/lib/constants';
import { PaymentHistory } from '@/components/PaymentHistory';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Tenant {
    id: string;
    full_name: string;
    phone: string;
    company_name?: string;
}

interface Contract {
    id: string;
    start_date: string;
    end_date?: string;
    monthly_rent: number;
    payment_day?: number;
    contract_file_url?: string;
    tenant?: Tenant;
}

interface Payment {
    id: string;
    period_month: string;
    charged_amount: number;
    paid_amount: number;
    status: string;
    payment_date?: string;
}

interface MarketSpace {
    id: string;
    code: string;
    sector?: string;
    space_type?: string;
    area_sqm?: number;
    base_rent?: number;
    status: string;
    description?: string;
    photos?: string[];
    activeContract?: Contract;
    payments?: Payment[];
}

export default function AccountantSpaceDetailsPage() {
    const params = useParams();
    const [space, setSpace] = useState<MarketSpace | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSpace = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_URL}/api/spaces/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to fetch space');
            }

            setSpace(result.data);
        } catch (error) {
            console.error('Error fetching space:', error);
            toast.error('Ошибка загрузки торгового места');
        } finally {
            setIsLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        if (params.id) {
            fetchSpace();
        }
    }, [params.id, fetchSpace]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ru-RU');
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!space) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-lg text-muted-foreground">Торговое место не найдено</p>
                <Link href="/accountant/spaces">
                    <Button variant="outline">Назад к списку</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/accountant/spaces">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{space.code}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge className={STATUS_COLORS[space.status as keyof typeof STATUS_COLORS]}>
                            {SPACE_STATUSES[space.status as keyof typeof SPACE_STATUSES]}
                        </Badge>
                        {space.area_sqm && (
                            <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{space.area_sqm} м²</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Информация о месте */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Информация о месте
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Код</p>
                            <p className="font-medium">{space.code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Сектор</p>
                            <p className="font-medium">{space.sector || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Тип</p>
                            <p className="font-medium">
                                {space.space_type ? SPACE_TYPES[space.space_type as keyof typeof SPACE_TYPES] : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Базовая аренда</p>
                            <p className="font-medium">
                                {space.base_rent ? `${new Intl.NumberFormat('ru-RU').format(space.base_rent)} сом` : '—'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Tenant Info */}
            {space.activeContract?.tenant && (
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <User className="h-5 w-5" />
                            Текущий арендатор
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">ФИО</p>
                                <p className="font-medium">{space.activeContract.tenant.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Телефон</p>
                                <p className="font-medium">{space.activeContract.tenant.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Период аренды</p>
                                <p className="font-medium">
                                    {formatDate(space.activeContract.start_date)}
                                    {space.activeContract.end_date
                                        ? ` — ${formatDate(space.activeContract.end_date)}`
                                        : ' — бессрочно'
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Месячная аренда</p>
                                <p className="font-medium text-green-600">
                                    {new Intl.NumberFormat('ru-RU').format(space.activeContract.monthly_rent)} сом
                                </p>
                            </div>
                        </div>
                        {space.activeContract.contract_file_url && (
                            <div className="mt-4">
                                <a
                                    href={space.activeContract.contract_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                    <FileText className="h-4 w-4" />
                                    Просмотр договора
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Photos */}
            {space.photos && space.photos.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Фотографии места</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {space.photos.map((url, index) => (
                                <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                    <img src={url} alt={`Фото ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <CardTitle>История платежей</CardTitle>
                    <CardDescription>Платежи по данному месту</CardDescription>
                </CardHeader>
                <CardContent>
                    <PaymentHistory payments={space.payments || []} />
                </CardContent>
            </Card>
        </div>
    );
}
