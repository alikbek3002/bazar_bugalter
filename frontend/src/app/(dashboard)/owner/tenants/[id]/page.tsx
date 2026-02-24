'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Phone, MapPin, Building2, Trash2, FileDown, Pencil, X, Upload, Check, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/FileUpload';
import { CONTRACT_STATUSES, STATUS_COLORS } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ContractData {
    id: string;
    status: string;
    monthly_rent: number;
    start_date: string;
    end_date?: string;
    deposit_amount?: number;
    payment_day?: number;
    space: {
        code: string;
        space_type: string;
    };
    contract_file_url?: string;
}

interface Tenant {
    id: string;
    full_name: string;
    phone: string;
    inn_idn?: string;
    company_name?: string;
    address?: string;
    notes?: string;
    contracts: ContractData[];
}

interface ContractEditForm {
    start_date: string;
    end_date: string;
    monthly_rent: string;
    status: string;
    contract_file_url: string;
}

export default function TenantDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Contract editing state
    const [editingContractId, setEditingContractId] = useState<string | null>(null);
    const [contractEditForm, setContractEditForm] = useState<ContractEditForm>({
        start_date: '',
        end_date: '',
        monthly_rent: '',
        status: '',
        contract_file_url: '',
    });
    const [isSavingContract, setIsSavingContract] = useState(false);
    const [showDocUpload, setShowDocUpload] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        company_name: '',
        inn_idn: '',
        address: '',
        notes: ''
    });

    const fetchTenant = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_URL}/api/tenants/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to fetch tenant');
            }

            const data = result.data;
            setTenant(data);
            setFormData({
                full_name: data.full_name || '',
                phone: data.phone || '',
                company_name: data.company_name || '',
                inn_idn: data.inn_idn || '',
                address: data.address || '',
                notes: data.notes || ''
            });
        } catch (error) {
            console.error('Error fetching tenant:', error);
            toast.error('Ошибка загрузки арендатора');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchTenant();
        }
    }, [params.id]);

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/tenants/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Данные арендатора обновлены');
            router.refresh();
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Ошибка обновления данных');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/tenants/${params.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Арендатор удалён, место освобождено');
            router.push('/owner/tenants');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Ошибка удаления арендатора');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // --- Contract editing ---
    const startEditingContract = (contract: ContractData) => {
        setEditingContractId(contract.id);
        setContractEditForm({
            start_date: contract.start_date?.split('T')[0] || '',
            end_date: contract.end_date?.split('T')[0] || '',
            monthly_rent: String(contract.monthly_rent || ''),
            status: contract.status,
            contract_file_url: contract.contract_file_url || '',
        });
        setShowDocUpload(false);
    };

    const cancelEditingContract = () => {
        setEditingContractId(null);
        setShowDocUpload(false);
    };

    const handleSaveContract = async () => {
        if (!editingContractId) return;

        setIsSavingContract(true);
        try {
            const token = localStorage.getItem('token');

            const updates: Record<string, unknown> = {
                start_date: contractEditForm.start_date,
                end_date: contractEditForm.end_date || null,
                monthly_rent: parseFloat(contractEditForm.monthly_rent),
                status: contractEditForm.status,
            };

            // Include contract_file_url if changed
            if (contractEditForm.contract_file_url) {
                updates.contract_file_url = contractEditForm.contract_file_url;
            }

            const response = await fetch(`${API_URL}/api/contracts/${editingContractId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            toast.success('Договор обновлён');
            setEditingContractId(null);
            setShowDocUpload(false);

            // Refresh tenant data
            setIsLoading(true);
            await fetchTenant();
        } catch (error) {
            console.error('Update contract error:', error);
            toast.error('Ошибка обновления договора');
        } finally {
            setIsSavingContract(false);
        }
    };

    const handleDocumentUpload = (url: string) => {
        setContractEditForm(prev => ({ ...prev, contract_file_url: url }));
        setShowDocUpload(false);
        toast.success('Новый документ загружен. Нажмите "Сохранить" для применения.');
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-lg text-muted-foreground">Арендатор не найден</p>
                <Link href="/owner/tenants">
                    <Button variant="outline">Назад к списку</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/owner/tenants">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{tenant.full_name}</h1>
                        <p className="text-muted-foreground">
                            {tenant.company_name || 'Частное лицо'} • {tenant.phone}
                        </p>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить арендатора
                </Button>
            </div>

            {/* Delete confirmation dialog */}
            {showDeleteConfirm && (
                <Card className="border-red-300 bg-red-50 dark:bg-red-900/20 max-w-2xl">
                    <CardContent className="pt-6">
                        <p className="font-medium text-red-700 dark:text-red-400 mb-2">
                            Вы уверены, что хотите удалить арендатора «{tenant.full_name}»?
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                            Все договоры будут удалены, а занятые места станут свободными.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Удаление...
                                    </>
                                ) : (
                                    'Да, удалить'
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                            >
                                Отмена
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    {/* Main Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Контактная информация</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">ФИО</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Телефон</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            className="pl-9"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Компания</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="company"
                                            className="pl-9"
                                            value={formData.company_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="inn">ИНН</Label>
                                    <Input
                                        id="inn"
                                        value={formData.inn_idn}
                                        onChange={(e) => setFormData(prev => ({ ...prev, inn_idn: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Адрес</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            className="pl-9"
                                            value={formData.address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Примечания</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button onClick={handleUpdate} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Сохранить</>}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Contracts History */}
                <div className="space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Список договоров</CardTitle>
                            <CardDescription>Активные и завершенные договоры</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tenant.contracts && tenant.contracts.length > 0 ? (
                                <div className="space-y-4">
                                    {tenant.contracts.map(contract => {
                                        const isEditing = editingContractId === contract.id;

                                        return (
                                            <div key={contract.id} className={`flex flex-col p-4 border rounded-lg gap-2 transition-colors ${isEditing ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-lg">{contract.space?.code || 'Место удалено'}</div>
                                                        <div className="text-sm text-muted-foreground">{contract.space?.space_type}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!isEditing ? (
                                                            <>
                                                                <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS]}>
                                                                    {CONTRACT_STATUSES[contract.status as keyof typeof CONTRACT_STATUSES]}
                                                                </Badge>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => startEditingContract(contract)}
                                                                    title="Редактировать договор"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Badge className="bg-blue-100 text-blue-800">Редактирование</Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {isEditing ? (
                                                    /* --- EDITING MODE --- */
                                                    <div className="space-y-3 mt-2">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Дата начала</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={contractEditForm.start_date}
                                                                    onChange={(e) => setContractEditForm(prev => ({ ...prev, start_date: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Дата окончания</Label>
                                                                <Input
                                                                    type="date"
                                                                    value={contractEditForm.end_date}
                                                                    onChange={(e) => setContractEditForm(prev => ({ ...prev, end_date: e.target.value }))}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Месячная аренда (сом)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={contractEditForm.monthly_rent}
                                                                    onChange={(e) => setContractEditForm(prev => ({ ...prev, monthly_rent: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Статус</Label>
                                                                <Select
                                                                    value={contractEditForm.status}
                                                                    onValueChange={(val) => setContractEditForm(prev => ({ ...prev, status: val }))}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="active">Активный</SelectItem>
                                                                        <SelectItem value="expired">Истёк</SelectItem>
                                                                        <SelectItem value="terminated">Расторгнут</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {/* Document section */}
                                                        <div className="space-y-2 pt-2 border-t">
                                                            <Label className="text-xs">Документ договора</Label>
                                                            {contractEditForm.contract_file_url ? (
                                                                <div className="flex items-center gap-2 p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                                                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                                                                    <span className="text-sm text-green-700 dark:text-green-400 truncate flex-1">
                                                                        Документ прикреплён
                                                                    </span>
                                                                    <a
                                                                        href={contractEditForm.contract_file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:underline"
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                    </a>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-xs h-7"
                                                                        onClick={() => setShowDocUpload(true)}
                                                                    >
                                                                        <Upload className="h-3 w-3 mr-1" />
                                                                        Заменить
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                                                                    <span className="text-sm text-muted-foreground italic flex-1">
                                                                        Файл не прикреплён
                                                                    </span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-xs h-7"
                                                                        onClick={() => setShowDocUpload(true)}
                                                                    >
                                                                        <Upload className="h-3 w-3 mr-1" />
                                                                        Загрузить
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            {showDocUpload && (
                                                                <div className="mt-2">
                                                                    <FileUpload
                                                                        type="document"
                                                                        accept=".pdf,.doc,.docx"
                                                                        tenantName={tenant.full_name}
                                                                        onUpload={handleDocumentUpload}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action buttons */}
                                                        <div className="flex justify-end gap-2 pt-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={cancelEditingContract}
                                                                disabled={isSavingContract}
                                                            >
                                                                <X className="mr-1 h-4 w-4" />
                                                                Отмена
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={handleSaveContract}
                                                                disabled={isSavingContract}
                                                            >
                                                                {isSavingContract ? (
                                                                    <>
                                                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                                        Сохранение...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Save className="mr-1 h-4 w-4" />
                                                                        Сохранить
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* --- VIEW MODE --- */
                                                    <>
                                                        <div className="grid grid-cols-2 text-sm gap-y-1 mt-2">
                                                            <span className="text-muted-foreground">Начало:</span>
                                                            <span>{new Date(contract.start_date).toLocaleDateString('ru-RU')}</span>

                                                            {contract.end_date && (
                                                                <>
                                                                    <span className="text-muted-foreground">Конец:</span>
                                                                    <span>{new Date(contract.end_date).toLocaleDateString('ru-RU')}</span>
                                                                </>
                                                            )}

                                                            <span className="text-muted-foreground">Аренда:</span>
                                                            <span className="font-medium">{contract.monthly_rent?.toLocaleString('ru-RU')} с</span>
                                                        </div>

                                                        {/* Contract File */}
                                                        <div className="mt-2 pt-2 border-t">
                                                            {contract.contract_file_url ? (
                                                                <a
                                                                    href={contract.contract_file_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    <FileDown className="h-4 w-4" />
                                                                    Скачать договор
                                                                </a>
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground italic">Файл договора не прикреплён</span>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-10">
                                    У арендатора нет договоров
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
