'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Eye, EyeOff, Calendar, Clock, AlertCircle } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { authAPI } from '@/lib/api';
import { useAppDispatch } from '@/store/hooks';
import { loginUser } from '@/store/slices/auth.slice';
import toast from '@/lib/toast';

// ============================================
// VALIDATION SCHEMA
// ============================================
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Please enter your full name')
    .max(50, 'Name must be under 50 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only include letters, spaces, apostrophes, and dashes'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email like name@example.com'),
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optional field

      // Remove spaces, dashes, and parentheses for validation
      const cleanedPhone = val.replace(/[\s\-()]/g, '');

      // Must start with + and have 7-15 digits total
      // Supports all international formats from all countries
      return /^\+\d{7,15}$/.test(cleanedPhone);
    }, {
      message: 'Enter a valid international phone number (e.g., +880 1712-345678)',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((p) => /[A-Z]/.test(p), {
      message: 'Password must contain at least one uppercase letter (A-Z)',
    })
    .refine((p) => /[a-z]/.test(p), {
      message: 'Password must contain at least one lowercase letter (a-z)',
    })
    .refine((p) => /\d/.test(p), {
      message: 'Password must contain at least one number (0-9)',
    })
    .refine((p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p), {
      message: 'Password must contain at least one special character (!@#$%^&*)',
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================
// ERROR HANDLER UTILITY
// ============================================
const getErrorMessage = (err: any): string => {
  // Handle validation errors array from backend
  if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
    const backendErrors = err.response.data.errors;
    return backendErrors.map((e: any) => e.message || `${e.field}: ${e.message}`).join(', ');
  }

  // Get message from backend response - show exact backend message
  const message = err.response?.data?.message || err.message || '';

  // Return backend message directly, or default message
  return message || 'Unable to create account. Please try again.';
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');

  // Verification states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Google auth
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Calendar helpers
  const today = new Date();
  const currentDayOfWeek = today.getDay();
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

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: '' },
  });

  // ============================================
  // EFFECTS
  // ============================================

  // Timer countdown
  useEffect(() => {
    if (step === 'verify' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  // Google Sign-In script
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return;

    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        initializeGoogleButton();
      };
    };

    const initializeGoogleButton = () => {
      if (window.google && googleButtonRef.current) {
        (window.google.accounts.id as any).initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleGoogleCallback,
          ux_mode: 'popup',
        });

        // Render the button
        (window.google.accounts.id as any).renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: googleButtonRef.current.offsetWidth, // Matches parent width
          text: 'signup_with',
          shape: 'pill', // Rounded corners like our other buttons
          logo_alignment: 'center',
        });
      }
    };

    // If script is already loaded
    if (window.google) {
      initializeGoogleButton();
    } else {
      loadGoogleScript();
    }

    // Handle resize to keep button full width
    const handleResize = () => {
      if (window.google && googleButtonRef.current) {
        (window.google.accounts.id as any).renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: googleButtonRef.current.offsetWidth,
          text: 'signup_with',
          shape: 'pill',
          logo_alignment: 'center',
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleGoogleCallback = async (response: any) => {
    try {
      setIsLoading(true);
      const result = await authAPI.googleAuth(response.credential);

      await dispatch(loginUser({
        user: result.data.user,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      }));

      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      await authAPI.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      setEmail(data.email);
      setStep('verify');
      toast.success('OTP sent! Please check your email.');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      // Show toast notification only
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('❌ Please enter a 6-digit OTP');
      return;
    }

    setVerifying(true);

    try {
      const result = await authAPI.verifyEmail({ email, otp });

      if (result.data.accessToken && result.data.refreshToken) {
        await dispatch(loginUser({
          user: result.data.user,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        }));

        toast.success('Email verified successfully!');
        router.push('/dashboard');
      } else {
        router.push('/login?verified=true');
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP(email);
      setOtp(''); // Clear old OTP
      setResendSuccess(true);
      setTimeLeft(120); 
      toast.success('New OTP sent successfully!');
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    }
  };

  // ============================================
  // RENDER: VERIFICATION STEP
  // ============================================
  if (step === 'verify') {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-100">
              {/* Header */}
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

              {/* Timer */}
              <div className="mb-8 flex items-center justify-center gap-2 bg-gray-50 py-3 rounded-lg border border-gray-200">
                <Clock className={`w-5 h-5 ${timeLeft > 0 ? 'text-[#3b82f6]' : 'text-red-500'}`} />
                <span className="text-sm font-medium">
                  {timeLeft > 0 ? (
                    <>
                      <span className="text-gray-600">Code expires in: </span>
                      <span className={`font-bold text-lg ${timeLeft <= 30
                        ? 'text-red-500 animate-pulse'
                        : timeLeft <= 60
                          ? 'text-orange-500'
                          : 'text-[#3b82f6]'
                        }`}>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-500 font-bold">⏰ Code expired! Click below to resend.</span>
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
                    disabled={timeLeft === 0}
                    className={`w-full px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all placeholder:text-gray-300 text-gray-800 ${timeLeft === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {/* Verify Button or Resend Button */}
                {timeLeft > 0 ? (
                  <button
                    onClick={handleVerifyOTP}
                    disabled={verifying || otp.length !== 6}
                    className="w-full py-4 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {verifying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify Email'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="w-full py-4 bg-gradient-to-r from-[#ea580c] to-[#c2410c] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    📧 Resend Verification Code
                  </button>
                )}

                {/* Back to Register */}
                <div className="pt-6 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      setStep('register');
                      setOtp('');
                    }}
                    className="text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
                  >
                    ← Back to Registration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // RENDER: REGISTRATION FORM
  // ============================================
  return (
    <>
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

              {/* Header */}
              <div className="mb-6 sm:mb-8 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                  Create an account
                </h1>
                <p className="text-gray-500 text-sm sm:text-base">Start your journey with us today.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    className={`w-full px-5 py-3.5 text-sm sm:text-base bg-white border rounded-xl focus:outline-none focus:ring-4 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${errors.name
                      ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500'
                      : 'border-gray-200 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6]'
                      }`}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name?.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    disabled={isLoading}
                    className={`w-full px-5 py-3.5 text-sm sm:text-base bg-[#eef2f6] rounded-xl focus:outline-none focus:ring-4 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${errors.email
                      ? 'border border-red-500 focus:ring-red-500/10 focus:border-red-500'
                      : 'border-transparent focus:ring-[#3b82f6]/10 focus:border-[#3b82f6]'
                      }`}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email?.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        defaultCountry="bd"
                        value={field.value || ''}
                        onChange={field.onChange}
                        disabled={isLoading}
                        className="w-full"
                        inputClassName="w-full px-5 py-3.5 text-sm sm:text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6] transition-all"
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone?.message as string}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, A-Z, a-z, 0-9, !@#$"
                    disabled={isLoading}
                    className={`w-full px-5 py-3.5 text-sm sm:text-base bg-[#eef2f6] rounded-xl focus:outline-none focus:ring-4 transition-all pr-12 disabled:opacity-60 disabled:cursor-not-allowed ${errors.password
                      ? 'border border-red-500 focus:ring-red-500/10 focus:border-red-500'
                      : 'border-transparent focus:ring-[#3b82f6]/10 focus:border-[#3b82f6]'
                      }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[38px] text-gray-400 hover:text-[#3b82f6] p-1 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password?.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full px-5 py-3.5 text-sm sm:text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/10 focus:border-[#3b82f6] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-3.5 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm sm:text-base mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Sign Up'
                  )}
                </button>

                {/* Google Sign-In */}
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                  <div ref={googleButtonRef} className="w-full -mt-2"></div>
                )}

                {/* Footer Links */}
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

          {/* Right Side - Image Section */}
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
                        className={`py-1.5 rounded-full flex items-center justify-center aspect-square ${isToday ? 'bg-[#3b82f6] text-white shadow-md font-bold' : 'text-gray-600'
                          }`}
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
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-tr from-blue-${i * 200} to-purple-500 ring-1 ring-black/5`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
