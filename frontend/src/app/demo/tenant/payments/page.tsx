'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, CheckCircle, Clock } from 'lucide-react';

// Mock data
const mockPayments = [
    { id: '1', period: 'Январь 2024', amount: 45000, status: 'pending', dueDate: '2024-01-25' },
    { id: '2', period: 'Декабрь 2023', amount: 45000, status: 'paid', paidDate: '2023-12-20' },
    { id: '3', period: 'Ноябрь 2023', amount: 45000, status: 'paid', paidDate: '2023-11-18' },
    { id: '4', period: 'Октябрь 2023', amount: 45000, status: 'paid', paidDate: '2023-10-22' },
    { id: '5', period: 'Сентябрь 2023', amount: 45000, status: 'paid', paidDate: '2023-09-19' },
    { id: '6', period: 'Август 2023', amount: 45000, status: 'paid', paidDate: '2023-08-21' },
];

export default function DemoTenantPaymentsPage() {
    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back button */}
                <Link href="/demo/tenant" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Назад в кабинет
                </Link>

                <div>
                    <h1 className="text-3xl font-bold text-white">Мои платежи</h1>
                    <p className="text-slate-400">История всех платежей за аренду</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-yellow-400" />
                                <CardDescription className="text-slate-400">К оплате</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-400">45,000 ₸</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <CardDescription className="text-slate-400">Оплачено за год</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">540,000 ₸</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-slate-400">Всего платежей</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{mockPayments.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payments History */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">История платежей</CardTitle>
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
                                                    : `Срок: ${payment.dueDate}`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-white">{payment.amount.toLocaleString()} ₸</p>
                                        <Badge className={payment.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                                            {payment.status === 'paid' ? 'Оплачено' : 'Ожидает'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
