'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    CreditCard, BarChart3, Bell, LogOut, Menu, X, Home,
    CheckCircle, Clock, AlertTriangle, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for demo
const mockPayments = [
    { id: 1, tenant: 'ИП Иванов А.А.', space: 'A-15', amount: 45000, status: 'pending', dueDate: '2024-01-25' },
    { id: 2, tenant: 'ООО Ромашка', space: 'B-03', amount: 78000, status: 'pending', dueDate: '2024-01-22' },
    { id: 3, tenant: 'ИП Петров Б.Б.', space: 'C-08', amount: 32000, status: 'overdue', dueDate: '2024-01-15' },
    { id: 4, tenant: 'ИП Сидорова В.В.', space: 'A-22', amount: 55000, status: 'paid', dueDate: '2024-01-20' },
    { id: 5, tenant: 'ООО ТехМаркет', space: 'D-11', amount: 92000, status: 'overdue', dueDate: '2024-01-10' },
];

const mockStats = {
    totalPending: 12,
    totalOverdue: 5,
    totalPaidThisMonth: 89,
    amountCollected: 3250000,
};

export default function DemoAccountantPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        { icon: CreditCard, label: 'Платежи', href: '/demo/accountant', active: true },
        { icon: BarChart3, label: 'Отчёты', href: '/demo/accountant/reports' },
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
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
                                    ? 'bg-green-600 text-white'
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
                        <h1 className="text-2xl font-bold text-white">Платежи</h1>
                        <p className="text-slate-400 text-sm">Управление оплатами аренды</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm border border-green-500/30">
                            📊 Бухгалтер (демо)
                        </span>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <Bell className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                    <CardDescription className="text-slate-400">Ожидают оплаты</CardDescription>
                                </div>
                                <CardTitle className="text-3xl text-white">{mockStats.totalPending}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    <CardDescription className="text-slate-400">Просрочено</CardDescription>
                                </div>
                                <CardTitle className="text-3xl text-red-400">{mockStats.totalOverdue}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <CardDescription className="text-slate-400">Оплачено в этом месяце</CardDescription>
                                </div>
                                <CardTitle className="text-3xl text-white">{mockStats.totalPaidThisMonth}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-slate-400">Собрано</CardDescription>
                                <CardTitle className="text-3xl text-green-400">
                                    {(mockStats.amountCollected / 1000000).toFixed(1)}M ₸
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Payments Table */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Список платежей</CardTitle>
                            <CardDescription className="text-slate-400">Отметьте оплаченные платежи</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockPayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${payment.status === 'paid' ? 'bg-green-500' :
                                                    payment.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`} />
                                            <div>
                                                <p className="font-medium text-white">{payment.tenant}</p>
                                                <p className="text-sm text-slate-400">Место: {payment.space} • До {payment.dueDate}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
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
                                            {payment.status !== 'paid' && (
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Отметить
                                                </Button>
                                            )}
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
