'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Loading } from '@/components/ui';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=' + pathname);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container-custom py-8">
        {children}
      </div>
    </div>
  );
}
