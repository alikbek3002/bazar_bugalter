'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, ArrowLeft, Phone, Building } from 'lucide-react';

// Mock data
const mockTenants = [
    { id: '1', full_name: 'Иванов Алексей Александрович', phone: '+7 701 123 4567', company_name: 'ИП Иванов А.А.', activeContracts: 1 },
    { id: '2', full_name: 'Петрова Мария Сергеевна', phone: '+7 702 234 5678', company_name: 'ООО Ромашка', activeContracts: 2 },
    { id: '3', full_name: 'Сидоров Борис Викторович', phone: '+7 703 345 6789', company_name: 'ИП Сидоров Б.В.', activeContracts: 1 },
    { id: '4', full_name: 'Козлова Анна Петровна', phone: '+7 704 456 7890', company_name: null, activeContracts: 0 },
    { id: '5', full_name: 'Новиков Дмитрий Игоревич', phone: '+7 705 567 8901', company_name: 'ООО ТехМаркет', activeContracts: 3 },
];

export default function DemoTenantsPage() {
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
                    <Button className="bg-blue-600 hover:bg-blue-700">
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
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                            Открыть
                                        </Button>
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
