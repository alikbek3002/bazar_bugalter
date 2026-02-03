'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-sidebar';
import { Loader2 } from 'lucide-react';

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (!token || !userData) {
                router.push('/login');
                return;
            }

            try {
                const parsedUser = JSON.parse(userData);
                if (parsedUser.role !== 'owner') {
                    router.push('/login');
                    return;
                }
                setUser(parsedUser);
            } catch (e) {
                console.error('Error parsing user data', e);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <DashboardLayout role="owner" userName={user.full_name || user.email}>
            {children}
        </DashboardLayout>
    );
}
