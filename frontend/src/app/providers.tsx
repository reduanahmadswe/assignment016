'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ReduxProvider } from '@/store/ReduxProvider';
import { useAppDispatch } from '@/store/hooks';
import { checkAuth } from '@/store/slices/auth.slice';

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <ReduxProvider>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          {children}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
              top: 20,
            }}
            toastOptions={{
              // Global defaults - individual toasts can override these
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                padding: '16px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '500px',
              },
              // Success-specific defaults
              success: {
                duration: 4000,
                style: {
                  background: '#D1FAE5',
                  color: '#065F46',
                  border: '2px solid #059669',
                },
                iconTheme: {
                  primary: '#059669',
                  secondary: '#D1FAE5',
                },
              },
              // Error-specific defaults
              error: {
                duration: 6000,
                style: {
                  background: '#FEE2E2',
                  color: '#7F1D1D',
                  border: '2px solid #DC2626',
                },
                iconTheme: {
                  primary: '#DC2626',
                  secondary: '#FEE2E2',
                },
              },
              // Loading-specific defaults
              loading: {
                style: {
                  background: '#F3F4F6',
                  color: '#374151',
                  border: '2px solid #9CA3AF',
                },
              },
            }}
          />
        </AuthInitializer>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
