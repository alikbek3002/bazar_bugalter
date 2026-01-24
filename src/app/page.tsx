import Link from 'next/link';
import { Building2, Users, FileText, CreditCard, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Bazar Bugalter
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Современная система управления рынком. Контроль торговых мест,
            арендаторов и платежей в одном месте.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6">
              Войти в систему
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">Торговые места</CardTitle>
              <CardDescription className="text-slate-400">
                Полный контроль всех торговых точек рынка
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm">
              Киоски, павильоны, контейнеры — отслеживайте статус и заполняемость
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-white">Арендаторы</CardTitle>
              <CardDescription className="text-slate-400">
                База данных всех арендаторов
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm">
              Контакты, история договоров, связь с торговыми местами
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-2">
                <CreditCard className="w-6 h-6 text-yellow-400" />
              </div>
              <CardTitle className="text-white">Платежи</CardTitle>
              <CardDescription className="text-slate-400">
                Контроль оплаты аренды
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm">
              Отметка платежей, учёт задолженностей, напоминания
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">Отчёты</CardTitle>
              <CardDescription className="text-slate-400">
                Аналитика и статистика
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm">
              Ежемесячные отчёты, графики доходов, экспорт в Excel
            </CardContent>
          </Card>
        </div>

        {/* Demo Section - Testing Only */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">🧪 Демо-режим</h2>
          <p className="text-slate-400 mb-8">Просмотр дашбордов без авторизации (только для тестирования)</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/demo/owner">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 px-8 py-6 text-lg">
                👑 Владелец
              </Button>
            </Link>
            <Link href="/demo/accountant">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 px-8 py-6 text-lg">
                📊 Бухгалтер
              </Button>
            </Link>
            <Link href="/demo/tenant">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 px-8 py-6 text-lg">
                🏪 Арендатор
              </Button>
            </Link>
          </div>
        </div>

        {/* Roles Info Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-white mb-8">Три роли — один интерфейс</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              👑 Владелец — полный контроль
            </div>
            <div className="px-6 py-3 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
              📊 Бухгалтер — управление платежами
            </div>
            <div className="px-6 py-3 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              🏪 Арендатор — личный кабинет
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
