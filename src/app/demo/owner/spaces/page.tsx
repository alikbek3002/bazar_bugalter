'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, ArrowLeft, Building2 } from 'lucide-react';

// Mock data
const mockSpaces = [
    { id: '1', code: 'A-01', sector: 'A', space_type: 'pavilion', area_sqm: 24, status: 'occupied', business_type: 'Одежда' },
    { id: '2', code: 'A-02', sector: 'A', space_type: 'kiosk', area_sqm: 12, status: 'vacant', business_type: null },
    { id: '3', code: 'A-03', sector: 'A', space_type: 'pavilion', area_sqm: 30, status: 'occupied', business_type: 'Электроника' },
    { id: '4', code: 'B-01', sector: 'B', space_type: 'container', area_sqm: 18, status: 'maintenance', business_type: null },
    { id: '5', code: 'B-02', sector: 'B', space_type: 'open_space', area_sqm: 8, status: 'occupied', business_type: 'Продукты' },
    { id: '6', code: 'C-01', sector: 'C', space_type: 'pavilion', area_sqm: 36, status: 'vacant', business_type: null },
];

const SPACE_TYPES: Record<string, string> = {
    kiosk: 'Киоск',
    pavilion: 'Павильон',
    open_space: 'Открытое место',
    container: 'Контейнер',
};

const SPACE_STATUSES: Record<string, string> = {
    occupied: 'Занято',
    vacant: 'Свободно',
    maintenance: 'Обслуживание',
};

const STATUS_COLORS: Record<string, string> = {
    occupied: 'bg-red-500',
    vacant: 'bg-green-500',
    maintenance: 'bg-yellow-500',
};

export default function DemoSpacesPage() {
    const stats = {
        total: mockSpaces.length,
        occupied: mockSpaces.filter(s => s.status === 'occupied').length,
        vacant: mockSpaces.filter(s => s.status === 'vacant').length,
        maintenance: mockSpaces.filter(s => s.status === 'maintenance').length,
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
                        <h1 className="text-3xl font-bold text-white">Торговые места</h1>
                        <p className="text-slate-400">Управление торговыми местами рынка</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить место
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Всего мест</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-400">Занято</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-400">{stats.occupied}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-400">Свободно</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">{stats.vacant}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-400">Обслуживание</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-400">{stats.maintenance}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Spaces List */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Список торговых мест</CardTitle>
                        <CardDescription className="text-slate-400">
                            {mockSpaces.length} мест в 3 секторах
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-slate-700/50 rounded-lg font-medium text-sm text-slate-300">
                                <div>Код</div>
                                <div>Сектор</div>
                                <div>Тип</div>
                                <div>Площадь</div>
                                <div>Статус</div>
                                <div>Действия</div>
                            </div>
                            {/* Table Body */}
                            {mockSpaces.map((space) => (
                                <div
                                    key={space.id}
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border border-slate-700 rounded-lg hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="font-medium text-white">{space.code}</div>
                                    <div className="text-slate-400">{space.sector}</div>
                                    <div className="text-slate-400">{SPACE_TYPES[space.space_type]}</div>
                                    <div className="text-slate-400">{space.area_sqm} м²</div>
                                    <div>
                                        <Badge className={STATUS_COLORS[space.status]}>
                                            {SPACE_STATUSES[space.status]}
                                        </Badge>
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
