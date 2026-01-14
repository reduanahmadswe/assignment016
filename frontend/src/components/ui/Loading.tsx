'use client';

import { cn } from '@/lib/utils';
import { Loader2, Sparkles, Calendar } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={cn('animate-spin text-primary-600', sizes[size], className)} />
  );
}

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ text = 'Loading...', fullScreen = false }: LoadingProps) {
  const isEventLoading = text?.toLowerCase().includes('event');

  if (fullScreen && isEventLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 z-50 flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Circles */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-300" />
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        </div>

        {/* Loading Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4">
          {/* Main Loading Animation */}
          <div className="relative mb-8">
            {/* Outer Ring - Rotating */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="w-32 h-32 rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-400 opacity-20" />
            </div>
            
            {/* Middle Ring - Counter Rotating */}
            <div className="absolute inset-0 animate-spin-reverse">
              <div className="w-32 h-32 rounded-full border-4 border-transparent border-b-indigo-400 border-l-blue-300 opacity-30" />
            </div>

            {/* Inner Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse" />
            </div>

            {/* Center Icon */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="relative">
                <Calendar className="w-16 h-16 text-indigo-600 animate-bounce-subtle" />
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-purple-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              {text}
            </h2>
            <p className="text-gray-600 text-sm md:text-base font-medium">
              Preparing something amazing for you...
            </p>
            
            {/* Loading Dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>

          {/* Bottom Decoration */}
          <div className="mt-12 flex items-center gap-6 opacity-40">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300" />
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300" />
          </div>
        </div>

        <style jsx>{`
          @keyframes spin-slow {
            to { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            to { transform: rotate(-360deg); }
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          .animate-spin-reverse {
            animation: spin-reverse 4s linear infinite;
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 2s ease-in-out infinite;
          }
          .animate-gradient {
            background-size: 200% auto;
            animation: gradient 3s ease infinite;
          }
          .delay-300 {
            animation-delay: 300ms;
          }
          .delay-700 {
            animation-delay: 700ms;
          }
          .bg-grid-pattern {
            background-image: 
              linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px);
            background-size: 40px 40px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      fullScreen ? 'fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 z-50' : 'py-12'
    )}>
      <div className="text-center space-y-6">
        {/* Modern 3D Loading Animation */}
        <div className="relative w-24 h-24 mx-auto">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="w-full h-full rounded-full border-4 border-transparent border-t-primary-500 border-r-primary-400" />
          </div>
          
          {/* Middle counter-rotating ring */}
          <div className="absolute inset-2 animate-spin-reverse">
            <div className="w-full h-full rounded-full border-4 border-transparent border-b-indigo-500 border-l-indigo-400" />
          </div>
          
          {/* Inner pulsing ring */}
          <div className="absolute inset-4 animate-pulse">
            <div className="w-full h-full rounded-full border-4 border-transparent border-t-purple-400 border-b-purple-300" />
          </div>
          
          {/* Center glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse" />
          </div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-gradient-to-br from-primary-600 to-purple-600 rounded-full animate-ping" />
            <div className="absolute w-3 h-3 bg-gradient-to-br from-primary-600 to-purple-600 rounded-full" />
          </div>
        </div>

        {/* Text with gradient animation */}
        <div className="space-y-2">
          <p className="text-lg font-bold bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            {text}
          </p>
          
          {/* Animated dots */}
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <Skeleton className="h-48 rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
