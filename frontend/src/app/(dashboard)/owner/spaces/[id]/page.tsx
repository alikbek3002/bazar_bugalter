'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, MapPin, User, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SPACE_STATUSES, SPACE_TYPES, STATUS_COLORS } from '@/lib/constants';
import { FileUpload } from '@/components/ui/FileUpload';
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

export default function SpaceDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [space, setSpace] = useState<MarketSpace | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        sector: '',
        space_type: '',
        area_sqm: '',
        base_rent: '',
        status: 'vacant',
        description: ''
    });

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

            const data = result.data;
            setSpace(data);
            setFormData({
                code: data.code || '',
                sector: data.sector || '',
                space_type: data.space_type || '',
                area_sqm: data.area_sqm?.toString() || '',
                base_rent: data.base_rent?.toString() || '',
                status: data.status,
                description: data.description || ''
            });
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

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/spaces/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: formData.code,
                    sector: formData.sector,
                    space_type: formData.space_type || null,
                    area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
                    base_rent: formData.base_rent ? parseFloat(formData.base_rent) : null,
                    status: formData.status,
                    description: formData.description
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to update space');

            toast.success('Торговое место обновлено');
            fetchSpace();
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error instanceof Error ? error.message : 'Ошибка обновления');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = (url: string) => {
        setSpace(prev => prev ? {
            ...prev,
            photos: [...(prev.photos || []), url]
        } : null);
    };

    const handlePhotoRemove = async (url: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/upload/space-photo/${params.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ photoUrl: url })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            setSpace(prev => prev ? {
                ...prev,
                photos: (prev.photos || []).filter(p => p !== url)
            } : null);
            toast.success('Фото удалено');
        } catch (error) {
            console.error('Delete photo error:', error);
            toast.error('Ошибка удаления фото');
        }
    };

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
                <Link href="/owner/spaces">
                    <Button variant="outline">Назад к списку</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/owner/spaces">
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

            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">Параметры</TabsTrigger>
                    <TabsTrigger value="photos">Фото</TabsTrigger>
                    <TabsTrigger value="payments">История платежей</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>Параметры места</CardTitle>
                            <CardDescription>Редактирование информации о точке</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Код / Номер *</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sector">Сектор</Label>
                                    <Input
                                        id="sector"
                                        value={formData.sector}
                                        onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Тип</Label>
                                    <Select
                                        value={formData.space_type}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, space_type: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(SPACE_TYPES).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="area">Площадь (м²)</Label>
                                    <Input
                                        type="number"
                                        id="area"
                                        value={formData.area_sqm}
                                        onChange={(e) => setFormData(prev => ({ ...prev, area_sqm: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rent">Базовая аренда (сом)</Label>
                                    <Input
                                        type="number"
                                        id="rent"
                                        value={formData.base_rent}
                                        onChange={(e) => setFormData(prev => ({ ...prev, base_rent: e.target.value }))}
                                    />
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
                                            {Object.entries(SPACE_STATUSES).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground text-yellow-600">
                                        Внимание: Статус "Занято" автоматически устанавливается при создании договора.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="desc">Описание</Label>
                                <Textarea
                                    id="desc"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={handleUpdate} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Сохранить</>}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="photos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Фотографии места</CardTitle>
                            <CardDescription>Добавьте фото торгового места</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                type="photo"
                                spaceId={space.id}
                                accept="image/*"
                                multiple={true}
                                existingUrls={space.photos || []}
                                onUpload={handlePhotoUpload}
                                onRemove={handlePhotoRemove}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payments">
                    <PaymentHistory payments={space.payments || []} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
