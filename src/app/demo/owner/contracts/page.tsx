'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, ArrowLeft, Calendar } from 'lucide-react';
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
const mockContracts = [
    { id: '1', tenant: 'ИП Иванов А.А.', space: 'A-01', start_date: '2024-01-01', end_date: '2024-12-31', monthly_rent: 45000, status: 'active' },
    { id: '2', tenant: 'ООО Ромашка', space: 'A-03', start_date: '2023-06-01', end_date: '2024-05-31', monthly_rent: 78000, status: 'active' },
    { id: '3', tenant: 'ИП Сидоров Б.В.', space: 'B-02', start_date: '2023-01-01', end_date: '2023-12-31', monthly_rent: 32000, status: 'expired' },
    { id: '4', tenant: 'ООО ТехМаркет', space: 'C-01', start_date: '2024-02-01', end_date: '2025-01-31', monthly_rent: 92000, status: 'active' },
];

const STATUS_LABELS: Record<string, string> = {
    active: 'Активен',
    expired: 'Истёк',
    terminated: 'Расторгнут',
};

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-500',
    expired: 'bg-yellow-500',
    terminated: 'bg-red-500',
};

export default function DemoContractsPage() {
    const [newContractOpen, setNewContractOpen] = useState(false);

    // Format number to avoid hydration errors
    const formatAmount = (amount: number) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
                        <h1 className="text-3xl font-bold text-white">Договоры</h1>
                        <p className="text-slate-400">Управление договорами аренды</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setNewContractOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Новый договор
                    </Button>
                </div>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Список договоров</CardTitle>
                        <CardDescription className="text-slate-400">
                            Всего {mockContracts.length} договоров
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-slate-700/50 rounded-lg font-medium text-sm text-slate-300">
                                <div>Арендатор</div>
                                <div>Место</div>
                                <div>Период</div>
                                <div>Аренда/мес</div>
                                <div>Статус</div>
                                <div>Действия</div>
                            </div>
                            {/* Table Body */}
                            {mockContracts.map((contract) => (
                                <div
                                    key={contract.id}
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border border-slate-700 rounded-lg hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="font-medium text-white">{contract.tenant}</div>
                                    <div className="text-slate-400">{contract.space}</div>
                                    <div className="text-slate-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {contract.start_date} — {contract.end_date}
                                    </div>
                                    <div className="text-white font-medium">{formatAmount(contract.monthly_rent)} ₸</div>
                                    <div>
                                        <Badge className={STATUS_COLORS[contract.status]}>
                                            {STATUS_LABELS[contract.status]}
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

            {/* Modal: Новый договор */}
            <Dialog open={newContractOpen} onOpenChange={setNewContractOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Новый договор аренды</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Оформление договора аренды торгового места
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="contract-tenant">Арендатор *</Label>
                            <Select>
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue placeholder="Выберите арендатора" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="1">ИП Иванов А.А.</SelectItem>
                                    <SelectItem value="2">ООО Ромашка</SelectItem>
                                    <SelectItem value="3">ИП Петров Б.Б.</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contract-space">Торговое место *</Label>
                            <Select>
                                <SelectTrigger className="bg-slate-700 border-slate-600">
                                    <SelectValue placeholder="Выберите место" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="A-01">A-01 (Павильон, 24 м²)</SelectItem>
                                    <SelectItem value="A-02">A-02 (Киоск, 12 м²)</SelectItem>
                                    <SelectItem value="C-01">C-01 (Павильон, 36 м²)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contract-start">Дата начала *</Label>
                            <Input id="contract-start" type="date" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contract-end">Дата окончания *</Label>
                            <Input id="contract-end" type="date" className="bg-slate-700 border-slate-600" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contract-amount">Сумма аренды (₸/месяц) *</Label>
                            <Input id="contract-amount" type="number" placeholder="45000" className="bg-slate-700 border-slate-600" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewContractOpen(false)} className="border-slate-600 hover:bg-slate-700 hover:text-white bg-transparent text-white">
                            Отмена
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                            alert('Договор создан! (демо)');
                            setNewContractOpen(false);
                        }}>
                            Создать договор
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
