'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Eye, EyeOff, Calendar, Clock } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { authAPI } from '@/lib/api';
  const [phone, setPhone] = useState('');
import { Alert } from '@/components/ui';
import { useAppDispatch } from '@/store/hooks';
import { loginUser } from '@/store/slices/auth.slice';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [resendSuccess, setResendSuccess] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

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

  // Timer countdown effect
  useEffect(() => {
    if (step === 'verify' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  // Load Google Sign-In script
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.google && googleButtonRef.current) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: handleGoogleCallback,
          });

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            { 
              theme: 'outline', 
              size: 'large',
              width: googleButtonRef.current.offsetWidth,
              text: 'signup_with',
              shape: 'rectangular',
            }
          );
        }
      };
    };

    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      loadGoogleScript();
    }
  }, []);

  const handleGoogleCallback = async (response: any) => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await authAPI.googleAuth(response.credential);
      
      // Store user data in Redux
      await dispatch(loginUser({
        user: result.data.user,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      }));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Google sign-in failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await authAPI.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      setEmail(data.email);
      setStep('verify');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Unable to create account. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      await authAPI.verifyEmail({ email, otp });
      router.push('/login?verified=true');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Unable to verify email. Please check your code and try again.';
      setError(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP(email);
      setResendSuccess(true);
      setTimeLeft(120);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Unable to resend code. Please try again.';
      setError(message);
    }
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100">
            {/* Icon & Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 text-[#3b82f6] mb-6 animate-pulse">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Verify Your Email
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                We've sent a 6-digit code to
              </p>
              <p className="text-[#3b82f6] font-medium mt-1 text-sm sm:text-base">{email}</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Success Alert */}
            {resendSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
                <p className="text-green-600 text-sm font-medium">✓ OTP sent successfully!</p>
              </div>
            )}

            {/* Timer */}
            <div className="mb-8 flex items-center justify-center gap-2 text-gray-600 bg-gray-50 py-2.5 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {timeLeft > 0 ? (
                  <>
                    Code expires in:{' '}
                    <span className={`font-bold ${timeLeft <= 30 ? 'text-red-500' : 'text-[#3b82f6]'}`}>
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </span>
                  </>
                ) : (
                  <span className="text-red-500 font-bold">Code expired! Please resend.</span>
                )}
              </span>
            </div>

            {/* OTP Input */}
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all placeholder:text-gray-300 text-gray-800"
                  maxLength={6}
                />
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOTP}
                disabled={verifying || otp.length !== 6}
                className="w-full bg-gradient-to-r from-[#ff7620] to-[#ff8c42] hover:from-[#e36315] hover:to-[#ff7620] text-white font-bold py-3.5 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed text-base"
              >
                {verifying ? 'Verifying...' : 'Verify Email'}
              </button>

              {/* Resend Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleResendOTP}
                    className="text-[#3b82f6] font-semibold hover:underline transition-colors block sm:inline mt-1 sm:mt-0"
                  >
                    Resend Code
                  </button>
                </p>
              </div>

              {/* Back to Register */}
              <div className="pt-6 border-t border-gray-100 text-center">
                <button
                  onClick={() => setStep('register')}
                  className="text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
                >
                  ← Back to Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[auto] lg:min-h-[700px] flex flex-col lg:flex-row">

        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-10 lg:p-12 bg-[#f8faff]/50 order-1">
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="mb-6 sm:mb-8 text-center lg:text-left">
              <Link href="/" className="inline-block px-5 py-2 border-2 border-[#3b82f6] rounded-full hover:bg-[#3b82f6] hover:text-white transition-colors group">
                <span className="text-lg font-bold text-[#3b82f6] tracking-wide group-hover:text-white transition-colors">ORIYET</span>
              </Link>
            </div>

            {/* Form Content */}
            <div className="mb-6 sm:mb-8 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Create an account
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">Start your journey with us today.</p>
            </div>

            {error && (
              <Alert variant="error" className="mb-6 animate-in slide-in-from-top-2" dismissible onDismiss={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">Full name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-5 py-3.5 text-sm sm:text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6] transition-all"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-5 py-3.5 text-sm sm:text-base bg-[#eef2f6] border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6] transition-all"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">Phone Number (Optional)</label>
                <PhoneInput
                  defaultCountry="bd"
                  value={phone}
                  onChange={(value) => {
                    setPhone(value);
                    // Update form value
                    (document.querySelector('input[name="phone"]') as HTMLInputElement)?.setAttribute('value', value);
                  }}
                  className="w-full"
                  inputClassName="w-full px-5 py-3.5 text-sm sm:text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6] transition-all"
                />
                <input
                  type="hidden"
                  name="phone"
                  value={phone}
                  {...register('phone')}
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 text-sm sm:text-base bg-[#eef2f6] border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6] transition-all pr-12"
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

              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 text-sm sm:text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6] transition-all"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-3.5 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>

              {/* Google Sign-In Button */}
              <div ref={googleButtonRef} className="w-full"></div>
              {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <p className="text-sm text-red-500 text-center">
                  Google Sign-In is not configured
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm mt-8 pt-4 gap-2 text-center sm:text-left">
                <div>
                  <span className="text-gray-500">Have an account? </span>
                  <Link href="/login" className="text-[#3b82f6] font-bold hover:underline">
                    Sign in
                  </Link>
                </div>
                <Link href="/terms" className="text-gray-500 hover:text-[#3b82f6] transition-colors">
                  Terms & Conditions
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Image Section (Hidden on Mobile) */}
        <div className="hidden lg:block relative w-1/2 m-4 rounded-[2.5rem] overflow-hidden order-2 group">
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070"
              alt="Team working together"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-500"></div>
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
            <div className="absolute top-36 right-8 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl w-64 transform transition-transform hover:scale-105 duration-300">
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
                      className={`py-1.5 rounded-full flex items-center justify-center aspect-square ${isToday ? 'bg-[#3b82f6] text-white shadow-md font-bold' : 'text-gray-600'}`}
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
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-tr from-blue-${i * 200} to-purple-500 ring-1 ring-black/5`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
