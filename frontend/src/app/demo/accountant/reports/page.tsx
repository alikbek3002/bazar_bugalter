'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, Download } from 'lucide-react';

export default function DemoAccountantReportsPage() {
    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Back button */}
                <Link href="/demo/accountant" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Назад к платежам
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Отчёты</h1>
                        <p className="text-slate-400">Финансовая отчётность</p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <Download className="mr-2 h-4 w-4" />
                        Экспорт в Excel
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Собрано за месяц</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-400">3,250,000 ₸</div>
                            <p className="text-sm text-slate-400 mt-2">89 платежей</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Ожидается</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-400">1,200,000 ₸</div>
                            <p className="text-sm text-slate-400 mt-2">12 платежей</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Задолженность</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-400">400,000 ₸</div>
                            <p className="text-sm text-slate-400 mt-2">5 должников</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Available Reports */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Доступные отчёты</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { name: 'Ежемесячный отчёт', desc: 'Сводка по платежам за месяц' },
                            { name: 'Отчёт по задолженностям', desc: 'Список должников' },
                            { name: 'Кассовый отчёт', desc: 'Движение денежных средств' },
                        ].map((report, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                                <div>
                                    <p className="font-medium text-white">{report.name}</p>
                                    <p className="text-sm text-slate-400">{report.desc}</p>
                                </div>
                                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                    <Download className="w-4 h-4 mr-1" />
                                    Скачать
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
