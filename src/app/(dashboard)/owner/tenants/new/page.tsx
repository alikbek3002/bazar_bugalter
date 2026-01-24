'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function NewTenantPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        company_name: '',
        inn_idn: '',
        email: '',
        whatsapp: '',
        telegram: '',
        notes: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.full_name || !formData.phone) {
            toast.error('Заполните обязательные поля (ФИО и Телефон)');
            return;
        }

        setIsLoading(true);
        try {
            const supabase = createClient();

            const { error } = await supabase
                .from('tenants')
                .insert({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    company_name: formData.company_name || null,
                    inn_idn: formData.inn_idn || null,
                    email: formData.email || null,
                    whatsapp: formData.whatsapp || null,
                    telegram: formData.telegram || null,
                    notes: formData.notes || null,
                });

            if (error) {
                toast.error('Ошибка', { description: error.message });
                return;
            }

            toast.success('Арендатор добавлен');
            router.push('/owner/tenants');
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
                <Link href="/owner/tenants">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Новый арендатор</h1>
                    <p className="text-muted-foreground">Заполните информацию об арендаторе</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Информация об арендаторе</CardTitle>
                    <CardDescription>Введите контактные данные</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">ФИО *</Label>
                            <Input
                                id="name"
                                placeholder="Иванов Иван Иванович"
                                value={formData.full_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Телефон *</Label>
                                <Input
                                    id="phone"
                                    placeholder="+7 777 123 45 67"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">Название компании</Label>
                                <Input
                                    id="company"
                                    placeholder="ИП Иванов"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="inn">ИИН/ИНН</Label>
                                <Input
                                    id="inn"
                                    placeholder="123456789012"
                                    value={formData.inn_idn}
                                    onChange={(e) => setFormData(prev => ({ ...prev, inn_idn: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input
                                    id="whatsapp"
                                    placeholder="+7 777 123 45 67"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telegram">Telegram</Label>
                                <Input
                                    id="telegram"
                                    placeholder="@username"
                                    value={formData.telegram}
                                    onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Примечания</Label>
                            <Textarea
                                id="notes"
                                placeholder="Дополнительная информация..."
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Сохранение...
                                    </>
                                ) : (
                                    'Создать арендатора'
                                )}
                            </Button>
                            <Link href="/owner/tenants">
                                <Button type="button" variant="outline">Отмена</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
