'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Upload, Check, FileText, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/FileUpload';
import { MarketSpace } from '@/types/database';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function NewTenantPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [vacantSpaces, setVacantSpaces] = useState<MarketSpace[]>([]);
    const [loadingSpaces, setLoadingSpaces] = useState(true);
    const [openCombobox, setOpenCombobox] = useState(false);

    // Tenant data
    const [tenantData, setTenantData] = useState({
        full_name: '',
        phone: '',
        company_name: '',
        inn: '',
        whatsapp: '',
        telegram: '',
        notes: '',
    });

    // Contract data
    const [contractData, setContractData] = useState({
        space_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        monthly_rent: '',
        payment_day: '1',
        deposit: '',
        contract_file_url: '',
    });

    // Fetch vacant spaces
    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/spaces`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success) {
                    setVacantSpaces(result.data.filter((s: MarketSpace) => s.status === 'vacant'));
                }
            } catch (error) {
                console.error('Error fetching spaces:', error);
            } finally {
                setLoadingSpaces(false);
            }
        };
        fetchSpaces();
    }, []);

    const validateStep1 = () => {
        if (!tenantData.full_name.trim()) {
            toast.error('Введите ФИО арендатора');
            return false;
        }
        if (!tenantData.phone.trim()) {
            toast.error('Введите номер телефона');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!contractData.space_id) {
            toast.error('Выберите торговое место');
            return false;
        }
        if (!contractData.start_date) {
            toast.error('Укажите дату начала аренды');
            return false;
        }
        if (!contractData.monthly_rent || parseFloat(contractData.monthly_rent) <= 0) {
            toast.error('Укажите месячную аренду');
            return false;
        }
        if (!contractData.contract_file_url) {
            toast.error('Загрузите документ договора');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/tenants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    // Tenant
                    full_name: tenantData.full_name,
                    phone: tenantData.phone,
                    inn: tenantData.inn || null,
                    company_name: tenantData.company_name || null,
                    whatsapp: tenantData.whatsapp || null,
                    telegram: tenantData.telegram || null,
                    notes: tenantData.notes || null,
                    // Contract
                    space_id: contractData.space_id,
                    start_date: contractData.start_date,
                    end_date: contractData.end_date || null,
                    monthly_rent: parseFloat(contractData.monthly_rent),
                    payment_day: parseInt(contractData.payment_day),
                    deposit: contractData.deposit ? parseFloat(contractData.deposit) : 0,
                    contract_file_url: contractData.contract_file_url,
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Ошибка создания');
            }

            toast.success('Арендатор и договор созданы');
            router.push('/owner/tenants');
            router.refresh();
        } catch (error) {
            console.error('Create error:', error);
            toast.error(error instanceof Error ? error.message : 'Произошла ошибка');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDocumentUpload = (url: string) => {
        setContractData(prev => ({ ...prev, contract_file_url: url }));
    };

    const selectedSpace = vacantSpaces.find(s => s.id === contractData.space_id);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/owner/tenants">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Новый арендатор</h1>
                    <p className="text-muted-foreground">
                        Шаг {step} из 2: {step === 1 ? 'Данные арендатора' : 'Договор аренды'}
                    </p>
                </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 max-w-2xl">
                <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            </div>

            {/* Step 1: Tenant Data */}
            {step === 1 && (
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Информация об арендаторе</CardTitle>
                        <CardDescription>Введите контактные данные</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ФИО *</Label>
                            <Input
                                id="name"
                                placeholder="Иванов Иван Иванович"
                                value={tenantData.full_name}
                                onChange={(e) => setTenantData(prev => ({ ...prev, full_name: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Телефон *</Label>
                            <Input
                                id="phone"
                                placeholder="+996 777 123 456"
                                value={tenantData.phone}
                                onChange={(e) => setTenantData(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">Название компании</Label>
                                <Input
                                    id="company"
                                    placeholder="ИП Иванов"
                                    value={tenantData.company_name}
                                    onChange={(e) => setTenantData(prev => ({ ...prev, company_name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="inn">ИИН/ИНН</Label>
                                <Input
                                    id="inn"
                                    placeholder="123456789012"
                                    value={tenantData.inn}
                                    onChange={(e) => setTenantData(prev => ({ ...prev, inn: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input
                                    id="whatsapp"
                                    placeholder="+996 777 123 456"
                                    value={tenantData.whatsapp}
                                    onChange={(e) => setTenantData(prev => ({ ...prev, whatsapp: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telegram">Telegram</Label>
                                <Input
                                    id="telegram"
                                    placeholder="@username"
                                    value={tenantData.telegram}
                                    onChange={(e) => setTenantData(prev => ({ ...prev, telegram: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Примечания</Label>
                            <Textarea
                                id="notes"
                                placeholder="Дополнительная информация..."
                                value={tenantData.notes}
                                onChange={(e) => setTenantData(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Link href="/owner/tenants">
                            <Button type="button" variant="outline">Отмена</Button>
                        </Link>
                        <Button onClick={handleNext}>
                            Далее <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* Step 2: Contract Data */}
            {step === 2 && (
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Договор аренды</CardTitle>
                        <CardDescription>Выберите место и загрузите договор</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="space">Торговое место *</Label>
                            {loadingSpaces ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Загрузка мест...
                                </div>
                            ) : vacantSpaces.length === 0 ? (
                                <p className="text-red-500">Нет свободных мест</p>
                            ) : (
                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCombobox}
                                            className="w-full justify-between"
                                        >
                                            {contractData.space_id
                                                ? vacantSpaces.find((space) => space.id === contractData.space_id)?.code
                                                    ? `${vacantSpaces.find((space) => space.id === contractData.space_id)?.code} ${vacantSpaces.find((space) => space.id === contractData.space_id)?.sector ? `Сектор ${vacantSpaces.find((space) => space.id === contractData.space_id)?.sector}` : ''} ${vacantSpaces.find((space) => space.id === contractData.space_id)?.area_sqm ? `(${vacantSpaces.find((space) => space.id === contractData.space_id)?.area_sqm} м²)` : ''}`
                                                    : "Выберите место"
                                                : "Выберите торговое место..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[400px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Поиск места по коду, сектору..." />
                                            <CommandList>
                                                <CommandEmpty>Место не найдено.</CommandEmpty>
                                                <CommandGroup>
                                                    {vacantSpaces.map((space) => (
                                                        <CommandItem
                                                            key={space.id}
                                                            value={`${space.code} ${space.sector || ''} ${space.row_number || ''} ${space.place_number || ''}`}
                                                            onSelect={() => {
                                                                setContractData(prev => ({ ...prev, space_id: space.id }));
                                                                setOpenCombobox(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    contractData.space_id === space.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-bold">{space.code}</span>
                                                                <div className="text-xs text-muted-foreground flex gap-2">
                                                                    {space.sector && <span>Сектор: {space.sector}</span>}
                                                                    {space.row_number && <span>Ряд: {space.row_number}</span>}
                                                                    {space.area_sqm && <span>Площадь: {space.area_sqm} м²</span>}
                                                                </div>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Дата начала *</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={contractData.start_date}
                                    onChange={(e) => setContractData(prev => ({ ...prev, start_date: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">Дата окончания</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={contractData.end_date}
                                    onChange={(e) => setContractData(prev => ({ ...prev, end_date: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">Оставьте пустым для бессрочного договора</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="monthly_rent">Месячная аренда (сом) *</Label>
                                <Input
                                    id="monthly_rent"
                                    type="number"
                                    placeholder="15000"
                                    value={contractData.monthly_rent}
                                    onChange={(e) => setContractData(prev => ({ ...prev, monthly_rent: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment_day">День платежа *</Label>
                                <Select
                                    value={contractData.payment_day}
                                    onValueChange={(val) => setContractData(prev => ({ ...prev, payment_day: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                                            <SelectItem key={day} value={day.toString()}>
                                                {day} число каждого месяца
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deposit">Депозит (сом)</Label>
                            <Input
                                id="deposit"
                                type="number"
                                placeholder="0"
                                value={contractData.deposit}
                                onChange={(e) => setContractData(prev => ({ ...prev, deposit: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Документ договора *</Label>
                            {contractData.contract_file_url ? (
                                <div className="flex items-center gap-2 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span className="text-green-700 dark:text-green-400">Документ загружен</span>
                                    <a
                                        href={contractData.contract_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Просмотр
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setContractData(prev => ({ ...prev, contract_file_url: '' }))}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            ) : (
                                <FileUpload
                                    type="document"
                                    accept=".pdf,.doc,.docx"
                                    tenantName={tenantData.full_name}
                                    onUpload={handleDocumentUpload}
                                />
                            )}
                            <p className="text-xs text-muted-foreground text-red-600">
                                Обязательно: без загрузки документа создание невозможно
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="outline" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !contractData.contract_file_url}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Создать арендатора
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
