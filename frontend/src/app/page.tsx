'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Calculator, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RoleType = 'owner' | 'accountant' | null;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function HomePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Отправляем запрос на бэкенд API
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Ошибка входа');
        setIsLoading(false);
        return;
      }

      const { user, token } = result.data;

      // Проверяем соответствие роли
      if (user.role !== selectedRole) {
        setError(`Этот аккаунт не является аккаунтом ${selectedRole === 'owner' ? 'владельца' : 'бухгалтера'}`);
        setIsLoading(false);
        return;
      }

      // Сохраняем данные пользователя и токен в localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      // Перенаправляем в соответствующий кабинет
      if (user.role === 'owner') {
        router.push('/owner/overview');
      } else if (user.role === 'accountant') {
        router.push('/accountant/payments');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Не удалось подключиться к серверу');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Bazar Bugalter</h1>
          <p className="text-slate-400 mt-2">Система управления рынком</p>
        </div>

        {/* Role Selection or Login Form */}
        {!selectedRole ? (
          <div className="space-y-4">
            <Card
              className="bg-slate-800/50 border-slate-700 backdrop-blur cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => setSelectedRole('owner')}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">👑 Владелец</CardTitle>
                  <CardDescription className="text-slate-400">
                    Полный контроль над рынком
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card
              className="bg-slate-800/50 border-slate-700 backdrop-blur cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => setSelectedRole('accountant')}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Calculator className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-xl">📊 Бухгалтер</CardTitle>
                  <CardDescription className="text-slate-400">
                    Управление платежами и отчётами
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedRole === 'owner' ? 'bg-blue-500/20' : 'bg-green-500/20'
                  }`}>
                  {selectedRole === 'owner' ? (
                    <Building2 className="w-6 h-6 text-blue-400" />
                  ) : (
                    <Calculator className="w-6 h-6 text-green-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-white">
                    {selectedRole === 'owner' ? '👑 Вход для владельца' : '📊 Вход для бухгалтера'}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Введите логин и пароль
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@bazar.kg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                      required
                      minLength={1}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Назад
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 ${selectedRole === 'owner'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
                      : 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900'
                      }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Вход...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
