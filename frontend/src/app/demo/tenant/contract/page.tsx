'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Calendar, Building2, Download } from 'lucide-react';

export default function DemoTenantContractPage() {
    const contract = {
        id: '1',
        space: 'A-15',
        spaceType: 'Павильон',
        area: 24,
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        monthlyRent: 45000,
        deposit: 90000,
        paymentDay: 25,
        status: 'active',
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back button */}
                <Link href="/demo/tenant" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Назад в кабинет
                </Link>

                <div>
                    <h1 className="text-3xl font-bold text-white">Мой договор</h1>
                    <p className="text-slate-400">Информация о договоре аренды</p>
                </div>

                {/* Contract Card */}
                <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Договор аренды №{contract.id}
                            </CardTitle>
                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                                Активен
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Space Info */}
                        <div className="p-4 rounded-lg bg-slate-800/50">
                            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Торговое место
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-slate-400 text-sm">Номер</p>
                                    <p className="text-lg font-semibold text-white">{contract.space}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Тип</p>
                                    <p className="text-lg font-semibold text-white">{contract.spaceType}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Площадь</p>
                                    <p className="text-lg font-semibold text-white">{contract.area} м²</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Аренда/мес</p>
                                    <p className="text-lg font-semibold text-purple-300">{contract.monthlyRent.toLocaleString()} ₸</p>
                                </div>
                            </div>
                        </div>

                        {/* Contract Details */}
                        <div className="p-4 rounded-lg bg-slate-800/50">
                            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Условия договора
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-slate-400 text-sm">Начало</p>
                                    <p className="text-white">{contract.startDate}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Окончание</p>
                                    <p className="text-white">{contract.endDate}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">День оплаты</p>
                                    <p className="text-white">{contract.paymentDay} числа</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Залог</p>
                                    <p className="text-white">{contract.deposit.toLocaleString()} ₸</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                <Download className="w-4 h-4 mr-2" />
                                Скачать договор (PDF)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
