'use client';

import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requireAuth = false) {
    const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && requireAuth && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, requireAuth, router]);

    return { user, isAuthenticated, isLoading };
}

export function useRequireAuth() {
    return useAuth(true);
}

export function useRequireAdmin() {
    const { user, isAuthenticated, isLoading } = useAuth(true);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated && user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    return { user, isAuthenticated, isLoading };
}
