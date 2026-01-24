'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, Download } from 'lucide-react';

export default function DemoReportsPage() {
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
                        <h1 className="text-3xl font-bold text-white">Отчёты</h1>
                        <p className="text-slate-400">Аналитика и статистика рынка</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Download className="mr-2 h-4 w-4" />
                        Экспорт в Excel
                    </Button>
                </div>

                {/* Revenue Chart Placeholder */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Доходы за год
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Динамика поступлений по месяцам
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                            {[65, 72, 68, 85, 78, 92, 88, 95, 82, 98, 105, 110].map((value, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                                        style={{ height: `${value * 2}px` }}
                                    />
                                    <span className="text-xs text-slate-500">
                                        {['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Доход за месяц</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-400">4,850,000 ₸</div>
                            <p className="text-sm text-green-400 mt-2">+12% к прошлому месяцу</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Средняя аренда</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">48,500 ₸</div>
                            <p className="text-sm text-slate-400 mt-2">за торговое место</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Заполняемость</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-400">84.7%</div>
                            <p className="text-sm text-blue-400 mt-2">+2.3% к прошлому месяцу</p>
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
                            { name: 'Отчёт по платежам', desc: 'Детальная информация о всех платежах' },
                            { name: 'Отчёт по задолженностям', desc: 'Список должников и суммы долгов' },
                            { name: 'Отчёт по договорам', desc: 'Статус всех договоров аренды' },
                            { name: 'Отчёт по заполняемости', desc: 'Статистика по торговым местам' },
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
