'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: string;
  loading?: boolean;
}

export function OTPInput({ length = 6, onComplete, error, loading }: OTPInputProps) {
  const [otp, setOTP] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOTP = [...otp];
    newOTP[index] = value.substring(value.length - 1);
    setOTP(newOTP);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are filled
    if (newOTP.every((digit) => digit !== '')) {
      onComplete(newOTP.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);

    if (/^\d+$/.test(pastedData)) {
      const newOTP = pastedData.split('');
      setOTP([...newOTP, ...new Array(length - newOTP.length).fill('')]);
      inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();

      if (newOTP.length === length) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={loading}
            className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            autoComplete="off"
          />
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-sm text-center animate-shake">{error}</p>
      )}
    </div>
  );
}
