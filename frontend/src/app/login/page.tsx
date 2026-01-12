'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Calendar, Shield, Mail, Smartphone } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAppDispatch } from '@/store/hooks';
import { loginUser } from '@/store/slices/auth.slice';
import { Alert } from '@/components/ui';
import { OTPInput } from '@/components/auth/OTPInput';
import Script from 'next/script';
import QuoteModal from '@/components/QuoteModal';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP verification state
  const [showOTPScreen, setShowOTPScreen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otpMethods, setOtpMethods] = useState({ email: true, authenticator: false });
  const [otpError, setOtpError] = useState('');
  const [useAuthenticator, setUseAuthenticator] = useState(false);
  
  // Quote modal state
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const redirect = searchParams.get('redirect') || '/dashboard';

  // Get current date info for calendar
  const today = new Date();
  const currentDayOfWeek = today.getDay();

  // Get calendar dates for current week
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.getDate());
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(data);
      
      // Check if OTP verification is required
      if (response.data.requiresOTP) {
        setUserEmail(data.email);
        setOtpMethods(response.data.otpMethods || { email: true, authenticator: false });
        setShowOTPScreen(true);
        setIsLoading(false);
        return;
      }

      // Direct login (admin or no 2FA)
      const { user, accessToken, refreshToken } = response.data;
      await dispatch(loginUser({ accessToken, refreshToken, user }));

      // Redirect based on user role - show quote for non-admin users
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        setPendingRedirect(redirect);
        setShowQuoteModal(true);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Unable to sign in. Please check your credentials and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otpCode: string) => {
    setIsLoading(true);
    setOtpError('');

    try {
      const payload: any = { email: userEmail };
      
      if (useAuthenticator) {
        payload.token = otpCode;
      } else {
        payload.otp = otpCode;
      }

      const response = await authAPI.verifyLoginOTP(payload);
      console.log('OTP Verification Response:', response.data);
      
      const { user, accessToken, refreshToken } = response.data;
      
      await dispatch(loginUser({ accessToken, refreshToken, user }));

      // Redirect based on user role - show quote for non-admin users
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        setPendingRedirect(redirect);
        setShowQuoteModal(true);
      }
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      const message = err.response?.data?.message || 'Invalid verification code. Please try again.';
      setOtpError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP(userEmail);
      setOtpError('');
      // Show success message (optional)
    } catch (err: any) {
      setOtpError('Failed to resend OTP. Please try again.');
    }
  };

  // Google Login Handler
  const handleGoogleResponse = async (response: any) => {
    try {
      if (!response.credential) throw new Error('No credential received');

      setIsLoading(true);
      // Call backend with ID Token
      const res = await authAPI.googleAuth(response.credential);
      const { user, accessToken, refreshToken } = res.data;

      await dispatch(loginUser({ accessToken, refreshToken, user }));

      // Show quote for non-admin users
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        setPendingRedirect(redirect);
        setShowQuoteModal(true);
      }
    } catch (err: any) {
      console.error('Google Login Error:', err);
      setError(err.response?.data?.message || 'Google login failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle quote modal close and redirect
  const handleQuoteModalClose = () => {
    setShowQuoteModal(false);
    if (pendingRedirect) {
      router.push(pendingRedirect);
    }
  };

  useEffect(() => {
    // Check if client ID exists to avoid errors
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // Safety check for window.google
    if (clientId && typeof window !== 'undefined' && window.google?.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
        });

        const btn = document.getElementById('googleSignInBtn');
        if (btn) {
          window.google.accounts.id.renderButton(
            btn,
            { theme: 'outline', size: 'large', width: 400, text: 'continue_with' }
          );
        }
      } catch (e) {
        console.error("Google Sign-In Init Error:", e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Script for Google Identity Services */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="lazyOnload"
        onLoad={() => {
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          if (clientId && window.google?.accounts) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleGoogleResponse,
            });
            const btn = document.getElementById('googleSignInBtn');
            if (btn) {
              window.google.accounts.id.renderButton(
                btn,
                { theme: 'outline', size: 'large', width: 400, text: 'continue_with' }
              );
            }
          }
        }}
      />

      <div className="w-full max-w-6xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[auto] lg:min-h-[700px] flex flex-col lg:flex-row">

        {/* Left Side - Image Section (Hidden on Mobile) */}
        <div className="hidden lg:block relative w-1/2 m-4 rounded-[2.0rem] overflow-hidden group">
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070"
              alt="Learning together"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
          </div>

          {/* Overlay UI Elements */}
          <div className="absolute inset-0 p-8 pointer-events-none">
            {/* Top notification */}
            <div className="absolute top-8 right-8 bg-[#3b82f6]/95 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 w-64 animate-fade-in-down">
              <div className="p-2 bg-white/20 rounded-lg shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Task Review With Team</p>
                <p className="text-xs opacity-90">09:30am-10:00am</p>
              </div>
            </div>

            {/* Calendar Widget */}
            <div className="absolute top-36 right-8 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl w-64 shadow-black/5 transform transition-transform hover:scale-105 duration-300">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={day} className={`${i === currentDayOfWeek ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {weekDates.map((date, i) => {
                  const isToday = i === currentDayOfWeek;
                  return (
                    <div
                      key={i}
                      className={`py-1.5 rounded-full flex items-center justify-center aspect-square ${isToday ? 'bg-[#3b82f6] text-white shadow-md font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {date}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Meeting Card */}
            <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-3xl p-4 shadow-xl flex items-center justify-between transform transition-all hover:translate-y-[-4px]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#ea580c] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Daily Meeting</p>
                  <p className="text-xs text-gray-500">12:00pm-01:00pm</p>
                </div>
              </div>
              <div className="flex -space-x-2 pl-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-indigo-500 ring-1 ring-black/5`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-10 lg:p-16 bg-[#f8faff]/50">
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="mb-6 sm:mb-8 text-center lg:text-left">
              <Link href="/" className="inline-block px-5 py-2 border-2 border-[#3b82f6] rounded-full hover:bg-[#3b82f6] hover:text-white transition-all group">
                <span className="text-lg font-bold text-[#3b82f6] group-hover:text-white tracking-wide transition-colors">ORIYET</span>
              </Link>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome Back!</h1>
              <p className="text-gray-500 text-sm sm:text-base">Sign in to continue your learning journey</p>
            </div>

            {error && (
              <Alert variant="error" className="mb-6 animate-in slide-in-from-top-2" dismissible onDismiss={() => setError('')}>
                {error}
              </Alert>
            )}

            {!showOTPScreen ? (
              <>
                {/* Test Credentials */}
                <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 mb-3 text-center sm:text-left">Test Credentials (Click to fill):</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setValue('email', 'admin@oriyet.com');
                        setValue('password', 'Admin@123');
                      }}
                      className="flex-1 px-4 py-2.5 bg-[#8b5cf6]/10 text-[#7c3aed] hover:bg-[#8b5cf6] hover:text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 border border-transparent hover:border-[#7c3aed]"
                    >
                      👑 Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setValue('email', 'demo@example.com');
                        setValue('password', 'Demo@123');
                      }}
                      className="flex-1 px-4 py-2.5 bg-[#1d4ed8]/10 text-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 border border-transparent hover:border-[#1d4ed8]"
                    >
                      👤 User
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  placeholder="admin@oriyet.com"
                  className="w-full px-5 py-3.5 text-sm sm:text-base bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6] transition-all shadow-sm"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 text-sm sm:text-base bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6] transition-all pr-12 shadow-sm"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-gray-400 hover:text-[#3b82f6] p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <label className="flex items-center cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#3b82f6] focus:ring-[#3b82f6] cursor-pointer" />
                  <span className="ml-2 text-gray-600 font-medium select-none group-hover:text-gray-900 transition-colors">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-[#3b82f6] font-bold hover:text-[#2563eb] hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#ff7620] to-[#ff8c42] hover:from-[#e36315] hover:to-[#ff7620] text-white font-bold text-sm sm:text-base py-3.5 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In to Oriyet'}
              </button>

              <div className="relative pt-2">
                {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg text-center mb-2 border border-amber-100">
                    Google Client ID unavailable. Button may not load.
                  </div>
                )}
                {/* Google Button Container */}
                <div id="googleSignInBtn" className="w-full h-[50px] flex justify-center">
                  {/* Fallback Custom Button to maintain look until GSI loads */}
                  <button
                    type="button"
                    disabled
                    className="w-full h-full flex items-center justify-center gap-3 px-4 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 opacity-60"
                  >
                    <svg className="w-5 h-5 opacity-50" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Loading Google...
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500 font-medium">
              New to Oriyet?{' '}
              <Link href="/register" className="text-[#3b82f6] font-bold hover:underline hover:text-[#2563eb] transition-colors">
                Create Free Account
              </Link>
            </div>
          </>
        ) : (
          // OTP Verification Screen
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-blue-100 rounded-full">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
              <p className="text-gray-600 text-sm">
                {useAuthenticator 
                  ? 'Enter the 6-digit code from your authenticator app'
                  : `We've sent a verification code to ${userEmail}`
                }
              </p>
            </div>

            {otpError && (
              <Alert variant="error" className="animate-in slide-in-from-top-2" dismissible onDismiss={() => setOtpError('')}>
                {otpError}
              </Alert>
            )}

            <OTPInput
              length={6}
              onComplete={handleOTPVerify}
              error={otpError}
              loading={isLoading}
            />

            {/* Toggle between email and authenticator */}
            {otpMethods.email && otpMethods.authenticator && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setUseAuthenticator(!useAuthenticator)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  {useAuthenticator ? (
                    <>
                      <Mail className="w-4 h-4" />
                      Use email code instead
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      Use authenticator app instead
                    </>
                  )}
                </button>
              </div>
            )}

            {!useAuthenticator && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-gray-600 hover:text-blue-600 font-medium"
                >
                  Didn't receive code? <span className="text-blue-600">Resend</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowOTPScreen(false);
                setOtpError('');
              }}
              className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to login
            </button>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Quote Modal */}
      <QuoteModal isOpen={showQuoteModal} onClose={handleQuoteModalClose} />
    </div>
  );
}
