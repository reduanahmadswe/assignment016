'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/auth.slice';
import { Menu, X, User, LogOut, Calendar, Award, ChevronDown, Settings, LayoutDashboard, BookOpen, Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Opportunities', href: '/opportunities' },
  { name: 'Events', href: '/events' },
  { name: 'Blog', href: '/blog' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const moreMenuItems = [
  { name: 'Past Events', href: '/events/past' },
  { name: 'Newsletter', href: '/newsletter' },
  { name: 'Donate Us', href: '/donate' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className={cn(
      'bg-white sticky top-0 z-50 transition-shadow duration-300',
      scrolled ? 'shadow-md' : 'shadow-sm'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative h-10 w-32 sm:h-12 sm:w-40 md:w-44 lg:w-48">
              <Image
                src="/images/oriyetlogo.png"
                alt="ORIYET"
                fill
                className="object-contain transition-transform group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300',
                  pathname === item.href
                    ? 'text-[#004aad] bg-[#004aad]/10'
                    : 'text-gray-600 hover:text-[#004aad] hover:bg-gray-50'
                )}
              >
                {item.name}
              </Link>
            ))}
            
            {/* More Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setMoreMenuOpen(true)}
              onMouseLeave={() => setMoreMenuOpen(false)}
            >
              <button
                className={cn(
                  'relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-1',
                  moreMenuItems.some(item => pathname === item.href)
                    ? 'text-[#004aad] bg-[#004aad]/10'
                    : 'text-gray-600 hover:text-[#004aad] hover:bg-gray-50'
                )}
              >
                More
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  moreMenuOpen && 'rotate-180'
                )} />
              </button>
              
              {moreMenuOpen && (
                <div className="absolute right-0 pt-2 z-50">
                  <div className="w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                    {moreMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className={cn(
                          'block px-4 py-2.5 text-sm font-medium transition-colors',
                          pathname === item.href
                            ? 'text-[#004aad] bg-[#004aad]/10'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden relative">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      (user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? 'U').toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{user.name || user.email?.split('@')[0]}</span>
                  <ChevronDown className={cn(
                    'w-4 h-4 text-gray-500 transition-transform',
                    userMenuOpen && 'rotate-180'
                  )} />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{user.name || user.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                        {user.role && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-700">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        )}
                      </div>
                      {user.role === 'admin' ? (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-3 text-primary-500" />
                          Admin Panel
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 mr-3 text-secondary-500" />
                            Dashboard
                          </Link>
                          <Link
                            href="/my-events"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Calendar className="w-4 h-4 mr-3 text-secondary-500" />
                            My Events
                          </Link>
                          <Link
                            href="/certificates"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Award className="w-4 h-4 mr-3 text-secondary-500" />
                            Certificates
                          </Link>
                          <div className="border-t border-gray-100 my-2"></div>
                          <div className="relative">
                            <button
                              onClick={() => setSettingsOpen(!settingsOpen)}
                              className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center">
                                <Settings className="w-4 h-4 mr-3 text-secondary-500" />
                                Settings
                              </div>
                              <ChevronRight className={cn(
                                "w-4 h-4 transition-transform",
                                settingsOpen && "rotate-90"
                              )} />
                            </button>
                            {settingsOpen && (
                              <div className="bg-gray-50 border-l-2 border-blue-500">
                                <Link
                                  href="/dashboard/profile"
                                  onClick={() => {
                                    setUserMenuOpen(false);
                                    setSettingsOpen(false);
                                  }}
                                  className="flex items-center px-4 py-2.5 pl-11 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                  <User className="w-3.5 h-3.5 mr-2" />
                                  Account Settings
                                </Link>
                                <Link
                                  href="/dashboard/security"
                                  onClick={() => {
                                    setUserMenuOpen(false);
                                    setSettingsOpen(false);
                                  }}
                                  className="flex items-center px-4 py-2.5 pl-11 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                  <Shield className="w-3.5 h-3.5 mr-2" />
                                  Security & 2FA
                                </Link>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      <div className="border-t border-gray-100 mt-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button className="btn-outline btn-sm">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="btn-cta btn-sm">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-semibold transition-colors',
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* More Dropdown in Mobile */}
              <div className="relative">
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between',
                    moreMenuItems.some(item => pathname === item.href)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  More
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform',
                    moreMenuOpen && 'rotate-180'
                  )} />
                </button>
                
                {moreMenuOpen && (
                  <div className="bg-gray-50 rounded-lg mt-1 border-l-2 border-blue-500 ml-2">
                    {moreMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => {
                          setIsOpen(false);
                          setMoreMenuOpen(false);
                        }}
                        className={cn(
                          'block px-4 py-2.5 pl-8 text-sm font-medium transition-colors',
                          pathname === item.href
                            ? 'text-[#004aad] bg-blue-50'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2 mb-2">
                      <p className="text-sm font-bold text-gray-900">{user.name || user.email?.split('@')[0]}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {user.role === 'admin' ? (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-semibold text-primary-600 hover:bg-primary-50"
                      >
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Admin Panel
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="w-5 h-5 mr-3 text-secondary-500" />
                          Dashboard
                        </Link>
                        <Link
                          href="/my-events"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Calendar className="w-5 h-5 mr-3 text-secondary-500" />
                          My Events
                        </Link>
                        <Link
                          href="/certificates"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <Award className="w-5 h-5 mr-3 text-secondary-500" />
                          Certificates
                        </Link>
                        <div className="border-t border-gray-100 my-2"></div>
                        <div className="relative">
                          <button
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <div className="flex items-center">
                              <Settings className="w-5 h-5 mr-3 text-secondary-500" />
                              Settings
                            </div>
                            <ChevronRight className={cn(
                              "w-4 h-4 transition-transform",
                              settingsOpen && "rotate-90"
                            )} />
                          </button>
                          {settingsOpen && (
                            <div className="bg-gray-50 rounded-lg mt-1 border-l-2 border-blue-500">
                              <Link
                                href="/dashboard/profile"
                                onClick={() => {
                                  setIsOpen(false);
                                  setSettingsOpen(false);
                                }}
                                className="flex items-center px-4 py-2.5 pl-12 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                <User className="w-4 h-4 mr-2" />
                                Account Settings
                              </Link>
                              <Link
                                href="/dashboard/security"
                                onClick={() => {
                                  setIsOpen(false);
                                  setSettingsOpen(false);
                                }}
                                className="flex items-center px-4 py-2.5 pl-12 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Security & 2FA
                              </Link>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 mt-2"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setIsOpen(false)} className="block">
                      <button className="btn-outline btn-sm w-full">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)} className="block">
                      <button className="btn-cta btn-sm w-full">
                        Get Started
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
