'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

interface UserLayoutProps {
    children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
    const pathname = usePathname();

    // Don't show navbar/footer on auth pages
    const isAuthPage = pathname?.startsWith('/login') ||
        pathname?.startsWith('/register') ||
        pathname?.startsWith('/forgot-password') ||
        pathname?.startsWith('/verify-email');

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar - Fixed at top */}
            <Navbar />

            {/* Main Content - No sidebar, just content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
