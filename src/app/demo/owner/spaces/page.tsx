'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, ArrowLeft, Building2 } from 'lucide-react';
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
        status: 'maintenance',
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
    const [addSpaceOpen, setAddSpaceOpen] = useState(false);
    const [viewSpaceOpen, setViewSpaceOpen] = useState(false);
    const [selectedSpace, setSelectedSpace] = useState<typeof mockSpaces[0] | null>(null);

    const stats = {
        total: mockSpaces.length,
        occupied: mockSpaces.filter(s => s.status === 'occupied').length,
        vacant: mockSpaces.filter(s => s.status === 'vacant').length,
        maintenance: mockSpaces.filter(s => s.status === 'maintenance').length,
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
                                    className="grid grid-cols-7 gap-4 px-4 py-3 border border-slate-700 rounded-lg hover:bg-slate-700/30 transition-colors"
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
                                            className="text-slate-400 hover:text-white"
                                            onClick={() => handleViewSpace(space)}
                                        >
                                            Открыть
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                    <SelectItem value="maintenance">Обслуживание</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddSpaceOpen(false)} className="border-slate-600">
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
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Торговое место {selectedSpace?.code}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Просмотр и редактирование информации о месте
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSpace && (
                        <div className="grid gap-4 py-4">
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
                                        <SelectItem value="maintenance">Обслуживание</SelectItem>
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
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewSpaceOpen(false)} className="border-slate-600">
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
