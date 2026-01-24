'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SPACE_TYPES, SPACE_STATUSES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

export default function NewSpacePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        sector: '',
        row_number: '',
        place_number: '',
        area_sqm: '',
        space_type: '',
        business_type: '',
        status: 'vacant',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.code) {
            toast.error('Код места обязателен');
            return;
        }

        setIsLoading(true);
        try {
            const supabase = createClient();

            const { error } = await supabase
                .from('market_spaces')
                .insert({
                    code: formData.code,
                    sector: formData.sector || null,
                    row_number: formData.row_number || null,
                    place_number: formData.place_number || null,
                    area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
                    space_type: formData.space_type || null,
                    business_type: formData.business_type || null,
                    status: formData.status,
                });

            if (error) {
                if (error.code === '23505') {
                    toast.error('Ошибка', { description: 'Место с таким кодом уже существует' });
                } else {
                    toast.error('Ошибка', { description: error.message });
                }
                return;
            }

            toast.success('Место добавлено');
            router.push('/owner/spaces');
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
                <Link href="/owner/spaces">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Новое торговое место</h1>
                    <p className="text-muted-foreground">Заполните информацию о месте</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Информация о месте</CardTitle>
                    <CardDescription>Введите данные торгового места</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Код места *</Label>
                                <Input
                                    id="code"
                                    placeholder="А-03-12"
                                    value={formData.code}
                                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">Уникальный код места</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sector">Сектор/Корпус</Label>
                                <Input
                                    id="sector"
                                    placeholder="A"
                                    value={formData.sector}
                                    onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="row">Ряд</Label>
                                <Input
                                    id="row"
                                    placeholder="03"
                                    value={formData.row_number}
                                    onChange={(e) => setFormData(prev => ({ ...prev, row_number: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="place">Номер места</Label>
                                <Input
                                    id="place"
                                    placeholder="12"
                                    value={formData.place_number}
                                    onChange={(e) => setFormData(prev => ({ ...prev, place_number: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Тип места</Label>
                                <Select
                                    value={formData.space_type}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, space_type: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите тип" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(SPACE_TYPES).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area">Площадь (м²)</Label>
                                <Input
                                    id="area"
                                    type="number"
                                    step="0.01"
                                    placeholder="15.5"
                                    value={formData.area_sqm}
                                    onChange={(e) => setFormData(prev => ({ ...prev, area_sqm: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="business">Тип деятельности</Label>
                                <Input
                                    id="business"
                                    placeholder="Овощи, Одежда..."
                                    value={formData.business_type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Статус</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите статус" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(SPACE_STATUSES).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Сохранение...
                                    </>
                                ) : (
                                    'Создать место'
                                )}
                            </Button>
                            <Link href="/owner/spaces">
                                <Button type="button" variant="outline">Отмена</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
