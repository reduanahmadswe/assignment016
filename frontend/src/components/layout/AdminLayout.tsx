'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    Award,
    Settings,
    LogOut,
    Menu,
    X,
    CreditCard,
    BookOpen,
    Briefcase,
    UserPlus,
    UserCog,
    Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/auth.slice';











interface AdminLayoutProps {
    children: React.ReactNode;
}

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Calendar, label: 'Events', href: '/admin/events' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: FileText, label: 'Registrations', href: '/admin/registrations' },
    { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
    { icon: Briefcase, label: 'Opportunities', href: '/admin/opportunities' },
    { icon: UserPlus, label: 'Applications', href: '/admin/applications' },
    { icon: BookOpen, label: 'Blog', href: '/admin/blog' },
    { icon: Newspaper, label: 'Newsletter', href: '/admin/newsletter' },
    { icon: UserCog, label: 'Profile', href: '/admin/profile' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    // State to track viewport size
    const [isMobile, setIsMobile] = useState(false);

    // State for Mobile Drawer (Open/Closed)
    const [isMobileOpen, setMobileOpen] = useState(false);

    // State for Desktop/Tablet Sidebar (Expanded/Collapsed)
    const [isExpanded, setExpanded] = useState(true);

    // State to track avatar image load error
    const [avatarError, setAvatarError] = useState(false);

    // Handle initial check and resize events
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width < 641;
            const tablet = width >= 641 && width <= 1024;
            const desktop = width > 1024;

            setIsMobile(mobile);

            // Auto-collapse on tablet, auto-expand on desktop if not interacting manually potentially
            // For simplicity and per requirements:
            // Tablet default: Collapsed
            // Desktop default: Expanded
            // We only set this if we are "crossing boundaries" or on init, but doing it on every resize might be annoying if user toggled it.
            // Let's rely on the user's manual toggle, but set initial defaults.
        };

        // Initial setup
        const width = window.innerWidth;
        if (width < 641) {
            setIsMobile(true);
            setMobileOpen(false);
        } else if (width <= 1024) {
            setIsMobile(false);
            setExpanded(false);
        } else {
            setIsMobile(false);
            setExpanded(true);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobile && isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobile, isMobileOpen]);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        router.push('/');
    };

    const toggleSidebar = () => {
        if (isMobile) {
            setMobileOpen(!isMobileOpen);
        } else {
            setExpanded(!isExpanded);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Backdrop */}
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Navigation */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col shadow-2xl",
                    // Mobile Styles
                    isMobile && "w-[85%] max-w-[320px]",
                    isMobile && !isMobileOpen && "-translate-x-full",
                    isMobile && isMobileOpen && "translate-x-0",
                    // Desktop/Tablet Styles
                    !isMobile && "translate-x-0 border-r border-slate-800",
                    !isMobile && isExpanded && "w-64",
                    !isMobile && !isExpanded && "w-[72px]"
                )}
                aria-label="Sidebar Navigation"
            >
                {/* Sidebar Header */}
                <div className={cn(
                    "h-16 flex items-center px-4 border-b border-slate-800/50 bg-slate-900/50",
                    !isMobile && !isExpanded ? "justify-center" : "justify-between"
                )}>
                    <Link href="/admin" className="flex items-center gap-3 overflow-hidden" onClick={() => isMobile && setMobileOpen(false)}>
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
                            <span className="font-extrabold text-white">O</span>
                        </div>
                        <span className={cn(
                            "font-bold text-lg tracking-tight whitespace-nowrap transition-all duration-300",
                            !isMobile && !isExpanded ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100 block"
                        )}>
                            Oriyet Admin
                        </span>
                    </Link>

                    {/* Mobile Close Button */}
                    {isMobile && (
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            aria-label="Close Sidebar"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-xl transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                                    // Spacing adjustments based on state
                                    !isMobile && !isExpanded ? "justify-center px-0 py-3" : "gap-3 px-3 py-3",
                                    isActive
                                        ? "bg-primary-600 shadow-md shadow-primary-900/20 text-white font-bold"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium"
                                )}
                                title={!isMobile && !isExpanded ? item.label : undefined}
                                onClick={() => isMobile && setMobileOpen(false)}
                            >
                                <Icon className={cn(
                                    "flex-shrink-0 transition-colors",
                                    !isMobile && !isExpanded ? "w-6 h-6" : "w-5 h-5",
                                    isActive ? "text-white" : "group-hover:text-white"
                                )} />

                                <span className={cn(
                                    "whitespace-nowrap transition-all duration-300 origin-left",
                                    !isMobile && !isExpanded ? "w-0 opacity-0 overflow-hidden hidden" : "w-auto opacity-100 block"
                                )}>
                                    {item.label}
                                </span>

                                {/* Tooltip for collapsed state (Tablet/Desktop) */}
                                {!isMobile && !isExpanded && (
                                    <div className="hidden group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap z-50 border border-slate-700 pointer-events-none animate-in fade-in slide-in-from-left-2 duration-200">
                                        {item.label}
                                        {/* Little triangular arrow */}
                                        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700"></div>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-900">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center w-full rounded-xl transition-all duration-200 group text-white hover:bg-red-500/10 hover:text-red-400 outline-none focus-visible:ring-2 focus-visible:ring-red-500",
                            !isMobile && !isExpanded ? "justify-center px-0 py-3" : "gap-3 px-3 py-3"
                        )}
                        title="Logout"
                    >
                        <LogOut className={cn(
                            "flex-shrink-0 transition-colors group-hover:text-red-400",
                            !isMobile && !isExpanded ? "w-6 h-6 text-red-500" : "w-5 h-5 text-red-500"
                        )} />
                        <span className={cn(
                            "font-bold whitespace-nowrap transition-all duration-300 overflow-hidden",
                            !isMobile && !isExpanded ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                        )}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                // Adjust margin based on sidebar state
                !isMobile && isExpanded ? "ml-64" : "",
                !isMobile && !isExpanded ? "ml-[72px]" : "",
                isMobile ? "ml-0" : ""
            )}>
                {/* Admin Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                        aria-label={isMobile ? (isMobileOpen ? "Close Sidebar" : "Open Sidebar") : (isExpanded ? "Collapse Sidebar" : "Expand Sidebar")}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-100 to-indigo-100 border border-white shadow-sm overflow-hidden p-0.5">
                                {user?.avatar && !avatarError ? (
                                    <img
                                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                                        alt={user.name || 'Admin'}
                                        className="w-full h-full rounded-full object-cover"
                                        onError={() => setAvatarError(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:flex flex-col items-start -space-y-0.5">
                                <span className="text-sm font-bold text-gray-800">
                                    {user?.name || 'Administrator'}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'User'}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50/50">
                    {children}
                </main>
            </div>
        </div>
    );
}
