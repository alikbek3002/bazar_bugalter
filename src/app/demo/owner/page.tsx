'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Building2, Users, FileText, CreditCard, BarChart3, Bell,
    Settings, LogOut, Menu, X, Home, PlusCircle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';


// Mock data for demo
const mockStats = {
    totalSpaces: 150,
    occupiedSpaces: 127,
    vacantSpaces: 23,
    totalTenants: 118,
    monthlyRevenue: 4850000,
    pendingPayments: 12,
    overduePayments: 5,
};

const mockRecentPayments = [
    { id: 1, tenant: 'ИП Иванов А.А.', amount: 45000, status: 'paid', date: '2024-01-20' },
    { id: 2, tenant: 'ООО Ромашка', amount: 78000, status: 'pending', date: '2024-01-22' },
    { id: 3, tenant: 'ИП Петров Б.Б.', amount: 32000, status: 'overdue', date: '2024-01-15' },
];

export default function DemoOwnerPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [newSpaceOpen, setNewSpaceOpen] = useState(false);
    const [newContractOpen, setNewContractOpen] = useState(false);
    const [newReportOpen, setNewReportOpen] = useState(false);


    const navItems = [
        { icon: Home, label: 'Обзор', href: '/demo/owner', active: true },
        { icon: Building2, label: 'Торговые места', href: '/demo/owner/spaces' },
        { icon: Users, label: 'Арендаторы', href: '/demo/owner/tenants' },
        { icon: FileText, label: 'Договоры', href: '/demo/owner/contracts' },
        { icon: CreditCard, label: 'Платежи', href: '/demo/owner/payments' },
        { icon: BarChart3, label: 'Отчёты', href: '/demo/owner/reports' },
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-white">Bazar Bugalter</span>
                        </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white">
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${item.active
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    {sidebarOpen && (
                        <div className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wider mb-2">
                            Демо-режим
                        </div>
                    )}
                    <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span>Выйти на главную</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Top Bar */}
                <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Обзор</h1>
                        <p className="text-slate-400 text-sm">Панель управления владельца</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm border border-blue-500/30">
                            👑 Владелец (демо)
                        </span>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <Bell className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-slate-400">Всего мест</CardDescription>
                                <CardTitle className="text-3xl text-white">{mockStats.totalSpaces}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-green-400">
                                    {mockStats.occupiedSpaces} занято • {mockStats.vacantSpaces} свободно
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-slate-400">Арендаторов</CardDescription>
                                <CardTitle className="text-3xl text-white">{mockStats.totalTenants}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-blue-400">Активных договоров</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-slate-400">Доход за месяц</CardDescription>
                                <CardTitle className="text-3xl text-white">
                                    {(mockStats.monthlyRevenue / 1000000).toFixed(1)}M ₸
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-green-400">+12% к прошлому месяцу</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-slate-400">Ожидают оплаты</CardDescription>
                                <CardTitle className="text-3xl text-white">{mockStats.pendingPayments}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-red-400">{mockStats.overduePayments} просрочено</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card
                            className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 cursor-pointer hover:border-blue-400/50 transition-colors"
                            onClick={() => setNewSpaceOpen(true)}
                        >
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/30 flex items-center justify-center">
                                    <PlusCircle className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Новое место</h3>
                                    <p className="text-sm text-slate-400">Добавить торговое место</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                            </CardContent>
                        </Card>

                        <Card
                            className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30 cursor-pointer hover:border-green-400/50 transition-colors"
                            onClick={() => setNewContractOpen(true)}
                        >
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-green-500/30 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Новый договор</h3>
                                    <p className="text-sm text-slate-400">Оформить аренду</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                            </CardContent>
                        </Card>

                        <Card
                            className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 cursor-pointer hover:border-purple-400/50 transition-colors"
                            onClick={() => setNewReportOpen(true)}
                        >
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/30 flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Отчёт</h3>
                                    <p className="text-sm text-slate-400">Сформировать отчёт</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Payments Table */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Последние платежи</CardTitle>
                            <CardDescription className="text-slate-400">Недавняя активность по оплатам</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockRecentPayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30">
                                        <div>
                                            <p className="font-medium text-white">{payment.tenant}</p>
                                            <p className="text-sm text-slate-400">{payment.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-white">{payment.amount.toLocaleString()} ₸</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${payment.status === 'paid'
                                                ? 'bg-green-500/20 text-green-400'
                                                : payment.status === 'pending'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {payment.status === 'paid' ? 'Оплачено' : payment.status === 'pending' ? 'Ожидает' : 'Просрочено'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Modal: Новое место */}
            <Dialog open={newSpaceOpen} onOpenChange={setNewSpaceOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Добавить торговое место</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Создание нового торгового места на рынке
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="space-code">Код места *</Label>
                            <Input id="space-code" placeholder="A-01" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="space-sector">Сектор *</Label>
                            <Input id="space-sector" placeholder="A" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="space-type">Тип места *</Label>
                            <Select>
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue placeholder="Выберите тип" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="kiosk">Киоск</SelectItem>
                                    <SelectItem value="pavilion">Павильон</SelectItem>
                                    <SelectItem value="open_space">Открытое место</SelectItem>
                                    <SelectItem value="container">Контейнер</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="space-area">Площадь (м²) *</Label>
                            <Input id="space-area" type="number" placeholder="24" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="space-status">Статус *</Label>
                            <Select>
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue placeholder="Выберите статус" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="vacant">Свободно</SelectItem>
                                    <SelectItem value="occupied">Занято</SelectItem>
                                    <SelectItem value="maintenance">Обслуживание</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewSpaceOpen(false)} className="border-slate-600">
                            Отмена
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                            alert('Место добавлено! (демо)');
                            setNewSpaceOpen(false);
                        }}>
                            Создать место
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Новый договор */}
            <Dialog open={newContractOpen} onOpenChange={setNewContractOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Новый договор аренды</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Оформление договора аренды торгового места
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="contract-tenant">Арендатор *</Label>
                            <Select>
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue placeholder="Выберите арендатора" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="1">ИП Иванов А.А.</SelectItem>
                                    <SelectItem value="2">ООО Ромашка</SelectItem>
                                    <SelectItem value="3">ИП Петров Б.Б.</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contract-space">Торговое место *</Label>
                            <Select>
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue placeholder="Выберите место" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="A-01">A-01 (Павильон, 24 м²)</SelectItem>
                                    <SelectItem value="A-02">A-02 (Киоск, 12 м²)</SelectItem>
                                    <SelectItem value="C-01">C-01 (Павильон, 36 м²)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contract-start">Дата начала *</Label>
                            <Input id="contract-start" type="date" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contract-end">Дата окончания *</Label>
                            <Input id="contract-end" type="date" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contract-amount">Сумма аренды (₸/месяц) *</Label>
                            <Input id="contract-amount" type="number" placeholder="45000" className="bg-slate-700 border-slate-600" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewContractOpen(false)} className="border-slate-600">
                            Отмена
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                            alert('Договор создан! (демо)');
                            setNewContractOpen(false);
                        }}>
                            Создать договор
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Сформировать отчёт */}
            <Dialog open={newReportOpen} onOpenChange={setNewReportOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Сформировать отчёт</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Выберите параметры для формирования отчёта
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="report-type">Тип отчёта *</Label>
                            <Select>
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue placeholder="Выберите тип отчёта" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="payments">Отчёт по платежам</SelectItem>
                                    <SelectItem value="occupancy">Отчёт по занятости</SelectItem>
                                    <SelectItem value="revenue">Отчёт по доходам</SelectItem>
                                    <SelectItem value="tenants">Отчёт по арендаторам</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="report-start">Период с *</Label>
                            <Input id="report-start" type="date" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="report-end">Период по *</Label>
                            <Input id="report-end" type="date" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="report-format">Формат экспорта *</Label>
                            <Select>
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue placeholder="Выберите формат" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewReportOpen(false)} className="border-slate-600">
                            Отмена
                        </Button>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                            alert('Отчёт сформирован! (демо)');
                            setNewReportOpen(false);
                        }}>
                            Сформировать
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
