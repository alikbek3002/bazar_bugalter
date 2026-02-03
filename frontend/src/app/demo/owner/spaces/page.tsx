'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MapPin, ArrowLeft, Building2, LayoutGrid, List, FileText, Clock, CreditCard } from 'lucide-react';
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

// Mock data
const mockSpaces = [
    {
        id: '1',
        code: 'A-01',
        sector: 'A',
        space_type: 'pavilion',
        area_sqm: 24,
        status: 'occupied',
        business_type: 'Одежда',
        tenant_id: '1',
        tenant_name: 'ИП Иванов А.А.',
        monthly_rent: 45000,
        contract_start: '2024-01-01',
        contract_end: '2024-12-31'
    },
    {
        id: '2',
        code: 'A-02',
        sector: 'A',
        space_type: 'kiosk',
        area_sqm: 12,
        status: 'vacant',
        business_type: null,
        tenant_id: null,
        tenant_name: null,
        monthly_rent: null,
        contract_start: null,
        contract_end: null
    },
    {
        id: '3',
        code: 'A-03',
        sector: 'A',
        space_type: 'pavilion',
        area_sqm: 30,
        status: 'occupied',
        business_type: 'Электроника',
        tenant_id: '2',
        tenant_name: 'ООО Ромашка',
        monthly_rent: 78000,
        contract_start: '2023-06-01',
        contract_end: '2024-05-31'
    },
    {
        id: '4',
        code: 'B-01',
        sector: 'B',
        space_type: 'container',
        area_sqm: 18,
        status: 'vacant',
        business_type: null,
        tenant_id: null,
        tenant_name: null,
        monthly_rent: null,
        contract_start: null,
        contract_end: null
    },
    {
        id: '5',
        code: 'B-02',
        sector: 'B',
        space_type: 'open_space',
        area_sqm: 8,
        status: 'occupied',
        business_type: 'Продукты',
        tenant_id: '3',
        tenant_name: 'ИП Сидоров Б.В.',
        monthly_rent: 32000,
        contract_start: '2024-01-01',
        contract_end: '2024-12-31'
    },
    {
        id: '6',
        code: 'C-01',
        sector: 'C',
        space_type: 'pavilion',
        area_sqm: 36,
        status: 'vacant',
        business_type: null,
        tenant_id: null,
        tenant_name: null,
        monthly_rent: null,
        contract_start: null,
        contract_end: null
    },
];

// Mock payments history for demo
const mockSpacePayments = [
    { id: '1', space_code: 'A-01', amount: 45000, date: '2024-01-20', status: 'paid', period: 'Январь 2024' },
    { id: '2', space_code: 'A-01', amount: 45000, date: '2023-12-20', status: 'paid', period: 'Декабрь 2023' },
    { id: '3', space_code: 'A-03', amount: 78000, date: '2024-01-22', status: 'pending', period: 'Январь 2024' },
    { id: '4', space_code: 'B-02', amount: 32000, date: '2024-01-15', status: 'overdue', period: 'Январь 2024' },
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
};

const STATUS_COLORS: Record<string, string> = {
    occupied: 'bg-red-500',
    vacant: 'bg-green-500',
};

export default function DemoSpacesPage() {
    const [addSpaceOpen, setAddSpaceOpen] = useState(false);
    const [viewSpaceOpen, setViewSpaceOpen] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState<typeof mockSpaces[0] | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const stats = {
        total: mockSpaces.length,
        occupied: mockSpaces.filter(s => s.status === 'occupied').length,
        vacant: mockSpaces.filter(s => s.status === 'vacant').length,
    };

    // Format number to avoid hydration errors
    const formatAmount = (amount: number) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const handleViewSpace = (space: typeof mockSpaces[0]) => {
        setSelectedSpace(space);
        setViewSpaceOpen(true);
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
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setAddSpaceOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить место
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
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

                </div>

                {/* Spaces List */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white">Список торговых мест</CardTitle>
                                <CardDescription className="text-slate-400">
                                    {mockSpaces.length} мест в 3 секторах
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-700/50 p-1 rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {viewMode === 'list' ? (
                            <div className="space-y-2">
                                {/* Table Header */}
                                <div className="grid grid-cols-7 gap-4 px-4 py-2 bg-slate-700/50 rounded-lg font-medium text-sm text-slate-300">
                                    <div>Код</div>
                                    <div>Сектор</div>
                                    <div>Тип</div>
                                    <div>Площадь</div>
                                    <div>Статус</div>
                                    <div>Арендатор</div>
                                    <div>Действия</div>
                                </div>
                                {/* Table Body */}
                                {mockSpaces.map((space) => (
                                    <div
                                        key={space.id}
                                        className="grid grid-cols-7 gap-4 px-4 py-3 border border-slate-700 rounded-lg hover:bg-slate-700/30 transition-colors items-center"
                                    >
                                        <div className="font-bold text-white">{space.code}</div>
                                        <div className="text-slate-400">{space.sector}</div>
                                        <div className="text-slate-400">{SPACE_TYPES[space.space_type]}</div>
                                        <div className="text-slate-400">{space.area_sqm} м²</div>
                                        <div>
                                            <Badge className={STATUS_COLORS[space.status]}>
                                                {SPACE_STATUSES[space.status]}
                                            </Badge>
                                        </div>
                                        <div>
                                            {space.status === 'occupied' && space.tenant_name ? (
                                                <div className="text-sm">
                                                    <div className="text-white font-medium">{space.tenant_name}</div>
                                                    <div className="text-emerald-400 text-xs">{formatAmount(space.monthly_rent!)} ₸/мес</div>
                                                    <div className="text-slate-400 text-xs">До: {space.contract_end}</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 text-sm">—</span>
                                            )}
                                        </div>
                                        <div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-400 hover:text-white hover:bg-slate-700"
                                                onClick={() => handleViewSpace(space)}
                                            >
                                                Открыть
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {mockSpaces.map((space) => (
                                    <div
                                        key={space.id}
                                        className={`bg-slate-700/30 border border-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 transition-all hover:border-slate-600 relative overflow-hidden group`}
                                        onClick={() => handleViewSpace(space)}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${space.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'}`} />

                                        <div className="flex justify-between items-start mb-2 pl-2">
                                            <div className="font-bold text-xl text-white">{space.code}</div>
                                            <Badge className={STATUS_COLORS[space.status]}>
                                                {SPACE_STATUSES[space.status]}
                                            </Badge>
                                        </div>

                                        <div className="space-y-1 pl-2 mb-3">
                                            <div className="text-sm text-slate-400 flex items-center gap-2">
                                                <MapPin className="w-3 h-3" />
                                                Сектор {space.sector} • {space.area_sqm} м²
                                            </div>
                                            <div className="text-sm text-slate-400 flex items-center gap-2">
                                                <Building2 className="w-3 h-3" />
                                                {SPACE_TYPES[space.space_type]}
                                            </div>
                                        </div>

                                        {space.status === 'occupied' && space.tenant_name ? (
                                            <div className="mt-3 pt-3 border-t border-slate-700/50 pl-2">
                                                <div className="text-sm font-medium text-white truncate">{space.tenant_name}</div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <div className="text-xs text-emerald-400 font-medium">{formatAmount(space.monthly_rent!)} ₸</div>
                                                    <div className="text-[10px] text-slate-500">{space.contract_end}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-3 pt-3 border-t border-slate-700/50 pl-2">
                                                <div className="text-xs text-green-400">Готово к аренде</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal: Добавить место */}
            <Dialog open={addSpaceOpen} onOpenChange={setAddSpaceOpen}>
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
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddSpaceOpen(false)} className="border-slate-600 hover:bg-slate-700 hover:text-white bg-transparent text-white">
                            Отмена
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                            alert('Место добавлено! (демо)');
                            setAddSpaceOpen(false);
                        }}>
                            Создать место
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Просмотр/Редактирование места */}
            <Dialog open={viewSpaceOpen} onOpenChange={setViewSpaceOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Торговое место {selectedSpace?.code}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Просмотр информации и истории торгового места
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSpace && (
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                                <TabsTrigger value="details">Детали и Редактирование</TabsTrigger>
                                <TabsTrigger value="history">История платежей</TabsTrigger>
                            </TabsList>

                            {/* TAB: Details */}
                            <TabsContent value="details" className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-code">Код места *</Label>
                                        <Input id="edit-code" defaultValue={selectedSpace.code} className="bg-slate-700 border-slate-600" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-sector">Сектор *</Label>
                                        <Input id="edit-sector" defaultValue={selectedSpace.sector} className="bg-slate-700 border-slate-600" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-type">Тип места *</Label>
                                        <Select defaultValue={selectedSpace.space_type}>
                                            <SelectTrigger className="bg-slate-700 border-slate-600">
                                                <SelectValue />
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
                                        <Label htmlFor="edit-area">Площадь (м²) *</Label>
                                        <Input id="edit-area" type="number" defaultValue={selectedSpace.area_sqm} className="bg-slate-700 border-slate-600" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-status">Статус *</Label>
                                        <Select defaultValue={selectedSpace.status}>
                                            <SelectTrigger className="bg-slate-700 border-slate-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="vacant">Свободно</SelectItem>
                                                <SelectItem value="occupied">Занято</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {selectedSpace.business_type && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-business">Тип бизнеса</Label>
                                            <Input id="edit-business" defaultValue={selectedSpace.business_type} className="bg-slate-700 border-slate-600" />
                                        </div>
                                    )}
                                </div>

                                {selectedSpace.status === 'occupied' && (
                                    <div className="border-t border-slate-700 pt-4 mt-2">
                                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-emerald-400" />
                                            Текущая аренда
                                        </h3>
                                        <div className="bg-slate-700/30 p-4 rounded-lg space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Арендатор:</span>
                                                <span className="text-white font-medium">{selectedSpace.tenant_name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Стоимость:</span>
                                                <span className="text-emerald-400 font-bold">{formatAmount(selectedSpace.monthly_rent!)} ₸/мес</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Договор:</span>
                                                <span className="text-white text-sm">{selectedSpace.contract_start} — {selectedSpace.contract_end}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            {/* TAB: History */}
                            <TabsContent value="history" className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm text-slate-400 px-2 mb-2">
                                        <span>Последние операции</span>
                                    </div>
                                    {mockSpacePayments.filter(p => p.space_code === selectedSpace.code).length > 0 ? (
                                        mockSpacePayments.filter(p => p.space_code === selectedSpace.code).map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-700">
                                                <div>
                                                    <div className="text-white font-medium">{payment.period}</div>
                                                    <div className="text-xs text-slate-400">{payment.date}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-white font-bold">{formatAmount(payment.amount)} ₸</div>
                                                    <Badge className={payment.status === 'paid' ? 'bg-green-500' : 'bg-red-500'}>
                                                        {payment.status === 'paid' ? 'Оплачено' : 'Долг'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-500 bg-slate-700/20 rounded-lg border border-dashed border-slate-700">
                                            История операций пуста
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewSpaceOpen(false)} className="border-slate-600 hover:bg-slate-700 hover:text-white bg-transparent text-white">
                            Закрыть
                        </Button>
                        <Button variant="destructive" onClick={() => {
                            if (confirm('Удалить это место?')) {
                                alert('Место удалено! (демо)');
                                setViewSpaceOpen(false);
                            }
                        }}>
                            Удалить
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                            alert('Изменения сохранены! (демо)');
                            setViewSpaceOpen(false);
                        }}>
                            Сохранить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
