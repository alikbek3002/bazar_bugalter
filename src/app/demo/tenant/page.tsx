'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    CreditCard, Bell, LogOut, Menu, X, Home,
    Building2, FileText, Calendar, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for demo
const mockTenantInfo = {
    name: 'ИП Иванов Алексей Александрович',
    space: 'A-15',
    spaceType: 'Павильон',
    area: 24,
    monthlyRent: 45000,
    contractEnd: '2025-12-31',
};

const mockPayments = [
    { id: 1, period: 'Январь 2024', amount: 45000, status: 'pending', dueDate: '2024-01-25' },
    { id: 2, period: 'Декабрь 2023', amount: 45000, status: 'paid', paidDate: '2023-12-20' },
    { id: 3, period: 'Ноябрь 2023', amount: 45000, status: 'paid', paidDate: '2023-11-18' },
    { id: 4, period: 'Октябрь 2023', amount: 45000, status: 'paid', paidDate: '2023-10-22' },
];

export default function DemoTenantPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        { icon: Home, label: 'Главная', href: '/demo/tenant', active: true },
        { icon: CreditCard, label: 'Мои платежи', href: '/demo/tenant/payments' },
        { icon: FileText, label: 'Мой договор', href: '/demo/tenant/contract' },
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
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
                                    ? 'bg-purple-600 text-white'
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
                        <h1 className="text-2xl font-bold text-white">Личный кабинет</h1>
                        <p className="text-slate-400 text-sm">Добро пожаловать, {mockTenantInfo.name.split(' ')[1]}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm border border-purple-500/30">
                            🏪 Арендатор (демо)
                        </span>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <Bell className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                    {/* Tenant Info Card */}
                    <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Моё торговое место
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-slate-400 text-sm">Номер места</p>
                                    <p className="text-2xl font-bold text-white">{mockTenantInfo.space}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Тип</p>
                                    <p className="text-lg font-semibold text-white">{mockTenantInfo.spaceType}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Площадь</p>
                                    <p className="text-lg font-semibold text-white">{mockTenantInfo.area} м²</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Аренда в месяц</p>
                                    <p className="text-lg font-semibold text-purple-300">{mockTenantInfo.monthlyRent.toLocaleString()} ₸</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                    <CardDescription className="text-slate-400">К оплате</CardDescription>
                                </div>
                                <CardTitle className="text-2xl text-yellow-400">
                                    {mockTenantInfo.monthlyRent.toLocaleString()} ₸
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-400">До 25 января 2024</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <CardDescription className="text-slate-400">Договор до</CardDescription>
                                </div>
                                <CardTitle className="text-2xl text-white">{mockTenantInfo.contractEnd}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-green-400">Активен</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <CardDescription className="text-slate-400">Оплачено за год</CardDescription>
                                </div>
                                <CardTitle className="text-2xl text-white">540,000 ₸</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-400">12 платежей</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment History */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">История платежей</CardTitle>
                            <CardDescription className="text-slate-400">Ваши последние платежи</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockPayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payment.status === 'paid' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                                                }`}>
                                                {payment.status === 'paid'
                                                    ? <CheckCircle className="w-5 h-5 text-green-400" />
                                                    : <Clock className="w-5 h-5 text-yellow-400" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{payment.period}</p>
                                                <p className="text-sm text-slate-400">
                                                    {payment.status === 'paid'
                                                        ? `Оплачено ${payment.paidDate}`
                                                        : `Срок оплаты: ${payment.dueDate}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-white">{payment.amount.toLocaleString()} ₸</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${payment.status === 'paid'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {payment.status === 'paid' ? 'Оплачено' : 'Ожидает'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
