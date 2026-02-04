'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginSchema, type LoginFormData } from '@/lib/validations/schemas';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(data: LoginFormData) {
        setIsLoading(true);
        try {
            // Отправляем запрос на бэкенд API
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                toast.error('Ошибка входа', {
                    description: result.error || 'Неверный email или пароль',
                });
                return;
            }

            const { user, token } = result.data;

            // Сохраняем данные пользователя и токен в localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);

            toast.success('Добро пожаловать!');

            // Редирект в зависимости от роли
            // Редирект в зависимости от роли
            // Используем window.location.href для жесткой перезагрузки и сброса состояния
            if (user.role === 'owner') {
                window.location.href = '/owner/overview';
            } else if (user.role === 'accountant') {
                window.location.href = '/accountant/payments';
            } else if (user.role === 'tenant') {
                window.location.href = '/tenant/dashboard';
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Произошла ошибка', {
                description: 'Не удалось подключиться к серверу',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md mx-4 bg-slate-800/80 border-slate-700 backdrop-blur">
            <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Вход в систему</CardTitle>
                <CardDescription className="text-slate-400">
                    Bazar Bugalter — управление рынком
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-200">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="email@example.com"
                                            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-200">Пароль</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Вход...
                                </>
                            ) : (
                                'Войти'
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-slate-400 hover:text-slate-300">
                        ← Вернуться на главную
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
