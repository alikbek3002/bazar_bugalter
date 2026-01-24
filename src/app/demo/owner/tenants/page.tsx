'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, CheckCircle, Download } from "lucide-react";

// Mock data
const mockTenants = [
    {
        id: '1',
        full_name: 'Иванов Алексей Александрович',
        phone: '+7 701 123 4567',
        company_name: 'ИП Иванов А.А.',
        activeContracts: 1,
        contracts: [
            { id: '101', space: 'A-01', start: '2024-01-01', end: '2024-12-31', amount: 45000, status: 'active' }
        ],
        payments_history: [
            { id: 'p1', date: '2024-01-20', period: 'Январь 2024', amount: 45000, status: 'paid', confirmed_by: 'Бухгалтер Мария', receipt: 'check_123.pdf' },
            { id: 'p2', date: '2023-12-20', period: 'Декабрь 2023', amount: 45000, status: 'paid', confirmed_by: 'Бухгалтер Мария', receipt: 'check_110.pdf' }
        ]
    },
    {
        id: '2',
        full_name: 'Петрова Мария Сергеевна',
        phone: '+7 702 234 5678',
        company_name: 'ООО Ромашка',
        activeContracts: 2,
        contracts: [
            { id: '102', space: 'A-03', start: '2023-06-01', end: '2024-05-31', amount: 78000, status: 'active' },
            { id: '103', space: 'B-05', start: '2024-01-01', end: '2024-12-31', amount: 55000, status: 'active' }
        ],
        payments_history: [
            { id: 'p3', date: '2024-01-22', period: 'Январь 2024', amount: 78000, status: 'pending', confirmed_by: null, receipt: null },
            { id: 'p4', date: '2023-12-22', period: 'Декабрь 2023', amount: 78000, status: 'paid', confirmed_by: 'Бухгалтер Мария', receipt: 'check_112.pdf' }
        ]
    },
    {
        id: '3',
        full_name: 'Сидоров Борис Викторович',
        phone: '+7 703 345 6789',
        company_name: 'ИП Сидоров Б.В.',
        activeContracts: 1,
        contracts: [
            { id: '104', space: 'B-02', start: '2024-01-01', end: '2024-12-31', amount: 32000, status: 'active' }
        ],
        payments_history: [
            { id: 'p5', date: '2024-01-15', period: 'Январь 2024', amount: 32000, status: 'overdue', confirmed_by: null, receipt: null }
        ]
    },
    {
        id: '4',
        full_name: 'Козлова Анна Петровна',
        phone: '+7 704 456 7890',
        company_name: null,
        activeContracts: 0,
        contracts: [],
        payments_history: []
    },
    {
        id: '5',
        full_name: 'Новиков Дмитрий Игоревич',
        phone: '+7 705 567 8901',
        company_name: 'ООО ТехМаркет',
        activeContracts: 1,
        contracts: [
            { id: '105', space: 'C-01', start: '2024-02-01', end: '2025-01-31', amount: 92000, status: 'active' }
        ],
        payments_history: []
    },
];

export default function DemoTenantsPage() {
    const [addTenantOpen, setAddTenantOpen] = useState(false);
    const [viewTenantOpen, setViewTenantOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<typeof mockTenants[0] | null>(null);

    // Format number to avoid hydration errors
    const formatAmount = (amount: number) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

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
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{selectedTenant?.full_name}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Просмотр и редактирование информации об арендаторе
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTenant && (
                        <Tabs defaultValue="info" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                                <TabsTrigger value="info">Информация</TabsTrigger>
                                <TabsTrigger value="contracts">Договоры</TabsTrigger>
                                <TabsTrigger value="payments">История платежей</TabsTrigger>
                            </TabsList>

                            {/* ТАБ: Информация */}
                            <TabsContent value="info" className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
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
                                        Сохранить изменения
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* ТАБ: Договоры */}
                            <TabsContent value="contracts" className="space-y-4 py-4">
                                <div className="space-y-2">
                                    {selectedTenant.contracts && selectedTenant.contracts.length > 0 ? (
                                        selectedTenant.contracts.map((contract) => (
                                            <div key={contract.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                                                <div>
                                                    <div className="font-medium text-white flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-blue-400" />
                                                        Торговое место: {contract.space}
                                                    </div>
                                                    <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                                        <Clock className="w-3 h-3" />
                                                        {contract.start} — {contract.end}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-white mb-1">{formatAmount(contract.amount)} ₸</div>
                                                    <Badge className={contract.status === 'active' ? 'bg-green-500' : 'bg-slate-500'}>
                                                        {contract.status === 'active' ? 'Активен' : 'Завершен'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">
                                            Нет активных договоров
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* ТАБ: История платежей */}
                            <TabsContent value="payments" className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-slate-700/50 rounded-lg font-medium text-sm text-slate-300">
                                        <div>Дата</div>
                                        <div>Период</div>
                                        <div>Сумма</div>
                                        <div>Статус</div>
                                        <div>Чек</div>
                                    </div>
                                    {selectedTenant.payments_history && selectedTenant.payments_history.length > 0 ? (
                                        selectedTenant.payments_history.map((payment) => (
                                            <div key={payment.id} className="grid grid-cols-5 gap-4 px-4 py-3 border border-slate-700 rounded-lg items-center">
                                                <div className="text-white text-sm">{payment.date || '—'}</div>
                                                <div className="text-slate-400 text-sm">{payment.period}</div>
                                                <div className="font-medium text-white">{formatAmount(payment.amount)} ₸</div>
                                                <div>
                                                    <Badge className={
                                                        payment.status === 'paid' ? 'bg-green-500' :
                                                            payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }>
                                                        {payment.status === 'paid' ? 'Оплачено' :
                                                            payment.status === 'pending' ? 'Ожидает' : 'Просрочено'}
                                                    </Badge>
                                                    {payment.confirmed_by && (
                                                        <div className="text-[10px] text-slate-500 mt-1">
                                                            {payment.confirmed_by}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    {payment.receipt ? (
                                                        <Button variant="ghost" size="sm" className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                                                            <Download className="w-3 h-3 mr-1" />
                                                            Скачать
                                                        </Button>
                                                    ) : (
                                                        <span className="text-slate-600 text-xs">—</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">
                                            История платежей пуста
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewTenantOpen(false)} className="border-slate-600">
                            Закрыть
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
