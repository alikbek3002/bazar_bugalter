import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AccountantReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Отчёты</h1>
                <p className="text-muted-foreground">Формирование отчётов по платежам</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Отчёты</CardTitle>
                    <CardDescription>Страница в разработке</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">Модуль отчётов в разработке</p>
                        <p className="text-sm">Здесь можно будет формировать отчёты по платежам за период</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
