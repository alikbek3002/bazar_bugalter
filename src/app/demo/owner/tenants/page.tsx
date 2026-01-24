'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, ArrowLeft, Phone, Building } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Mock data
const mockTenants = [
    { id: '1', full_name: 'Иванов Алексей Александрович', phone: '+7 701 123 4567', company_name: 'ИП Иванов А.А.', activeContracts: 1 },
    { id: '2', full_name: 'Петрова Мария Сергеевна', phone: '+7 702 234 5678', company_name: 'ООО Ромашка', activeContracts: 2 },
    { id: '3', full_name: 'Сидоров Борис Викторович', phone: '+7 703 345 6789', company_name: 'ИП Сидоров Б.В.', activeContracts: 1 },
    { id: '4', full_name: 'Козлова Анна Петровна', phone: '+7 704 456 7890', company_name: null, activeContracts: 0 },
    { id: '5', full_name: 'Новиков Дмитрий Игоревич', phone: '+7 705 567 8901', company_name: 'ООО ТехМаркет', activeContracts: 3 },
];

export default function DemoTenantsPage() {
    const [addTenantOpen, setAddTenantOpen] = useState(false);
    const [viewTenantOpen, setViewTenantOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<typeof mockTenants[0] | null>(null);

    const handleViewTenant = (tenant: typeof mockTenants[0]) => {
        setSelectedTenant(tenant);
        setViewTenantOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Back button */}
                <Link href="/demo/owner" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Назад к обзору
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Арендаторы</h1>
                        <p className="text-slate-400">База данных арендаторов рынка</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setAddTenantOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить арендатора
                    </Button>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Список арендаторов</CardTitle>
                        <CardDescription className="text-slate-400">
                            Всего {mockTenants.length} арендаторов
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-slate-700/50 rounded-lg font-medium text-sm text-slate-300">
                                <div>ФИО</div>
                                <div>Телефон</div>
                                <div>Компания</div>
                                <div>Договоры</div>
                                <div>Действия</div>
                            </div>
                            {/* Table Body */}
                            {mockTenants.map((tenant) => (
                                <div
                                    key={tenant.id}
                                    className="grid grid-cols-5 gap-4 px-4 py-3 border border-slate-700 rounded-lg hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="font-medium text-white">{tenant.full_name}</div>
                                    <div className="text-slate-400 flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {tenant.phone}
                                    </div>
                                    <div className="text-slate-400 flex items-center gap-2">
                                        {tenant.company_name ? (
                                            <>
                                                <Building className="w-4 h-4" />
                                                {tenant.company_name}
                                            </>
                                        ) : '—'}
                                    </div>
                                    <div>
                                        {tenant.activeContracts > 0 ? (
                                            <Badge className="bg-green-500">{tenant.activeContracts} активных</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-600">Нет договоров</Badge>
                                        )}
                                    </div>
                                    <div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-400 hover:text-white"
                                            onClick={() => handleViewTenant(tenant)}
                                        >
                                            Открыть
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal: Добавить арендатора */}
            <Dialog open={addTenantOpen} onOpenChange={setAddTenantOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Добавить арендатора</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Регистрация нового арендатора в системе
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tenant-name">ФИО *</Label>
                            <Input id="tenant-name" placeholder="Иванов Алексей Александрович" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tenant-iin">ИИН *</Label>
                            <Input id="tenant-iin" placeholder="123456789012" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tenant-phone">Телефон *</Label>
                            <Input id="tenant-phone" placeholder="+7 701 123 4567" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tenant-email">Email</Label>
                            <Input id="tenant-email" type="email" placeholder="example@mail.com" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tenant-company">Название компании</Label>
                            <Input id="tenant-company" placeholder="ИП Иванов А.А." className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tenant-bin">БИН</Label>
                            <Input id="tenant-bin" placeholder="123456789012" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tenant-address">Адрес *</Label>
                            <Input id="tenant-address" placeholder="г. Алматы, ..." className="bg-slate-700 border-slate-600" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddTenantOpen(false)} className="border-slate-600">
                            Отмена
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                            alert('Арендатор добавлен! (демо)');
                            setAddTenantOpen(false);
                        }}>
                            Создать арендатора
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Просмотр/Редактирование арендатора */}
            <Dialog open={viewTenantOpen} onOpenChange={setViewTenantOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedTenant?.full_name}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Просмотр и редактирование информации об арендаторе
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTenant && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">ФИО *</Label>
                                <Input id="edit-name" defaultValue={selectedTenant.full_name} className="bg-slate-700 border-slate-600" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-phone">Телефон *</Label>
                                <Input id="edit-phone" defaultValue={selectedTenant.phone} className="bg-slate-700 border-slate-600" />
                            </div>
                            {selectedTenant.company_name && (
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-company">Название компании</Label>
                                    <Input id="edit-company" defaultValue={selectedTenant.company_name} className="bg-slate-700 border-slate-600" />
                                </div>
                            )}
                            <div className="border-t border-slate-600 pt-4 mt-2">
                                <h3 className="font-medium text-white mb-2">Информация о договорах</h3>
                                <p className="text-slate-400 text-sm">
                                    Активных договоров: <span className="text-green-400 font-medium">{selectedTenant.activeContracts}</span>
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewTenantOpen(false)} className="border-slate-600">
                            Закрыть
                        </Button>
                        <Button variant="destructive" onClick={() => {
                            if (confirm('Удалить этого арендатора?')) {
                                alert('Арендатор удалён! (демо)');
                                setViewTenantOpen(false);
                            }
                        }}>
                            Удалить
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                            alert('Изменения сохранены! (демо)');
                            setViewTenantOpen(false);
                        }}>
                            Сохранить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
