import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText } from 'lucide-react';
import { CONTRACT_STATUSES, STATUS_COLORS } from '@/lib/constants';

export default async function OwnerContractsPage() {
    const supabase = await createClient();

    const { data: contracts } = await supabase
        .from('lease_contracts')
        .select(`
      *,
      tenant:tenants(full_name, phone),
      space:market_spaces(code, sector)
    `)
        .order('created_at', { ascending: false });

    const allContracts = contracts || [];
    const activeContracts = allContracts.filter(c => c.status === 'active');
    const expiredContracts = allContracts.filter(c => c.status === 'expired');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Договоры</h1>
                    <p className="text-muted-foreground">Управление договорами аренды</p>
                </div>
                <Link href="/owner/contracts/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Новый договор
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Всего договоров</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allContracts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Активные</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeContracts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Истёкшие</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-500">{expiredContracts.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Список договоров</CardTitle>
                    <CardDescription>
                        {allContracts.length} договоров
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {allContracts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Договоры не найдены</p>
                            <p className="text-sm mb-4">Создайте первый договор</p>
                            <Link href="/owner/contracts/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Новый договор
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Table Header */}
                            <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium text-sm">
                                <div>Арендатор</div>
                                <div>Место</div>
                                <div>Период</div>
                                <div>Аренда/мес</div>
                                <div>Статус</div>
                                <div>Действия</div>
                            </div>
                            {/* Table Body */}
                            {allContracts.map((contract) => (
                                <div
                                    key={contract.id}
                                    className="grid grid-cols-6 gap-4 px-4 py-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="font-medium">{contract.tenant?.full_name || 'Не указан'}</div>
                                    <div className="text-muted-foreground">{contract.space?.code || 'Не указано'}</div>
                                    <div className="text-muted-foreground text-sm">
                                        {new Date(contract.start_date).toLocaleDateString('ru-RU')}
                                        {contract.end_date && ` — ${new Date(contract.end_date).toLocaleDateString('ru-RU')}`}
                                    </div>
                                    <div className="font-medium">{contract.monthly_rent.toLocaleString('ru-RU')} ₸</div>
                                    <div>
                                        <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS]}>
                                            {CONTRACT_STATUSES[contract.status as keyof typeof CONTRACT_STATUSES]}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Link href={`/owner/contracts/${contract.id}`}>
                                            <Button variant="ghost" size="sm">Открыть</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
