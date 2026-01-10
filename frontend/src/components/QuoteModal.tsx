'use client';

import { useState, useEffect } from 'react';
import { X, Quote as QuoteIcon } from 'lucide-react';
import { getRandomQuote, Quote } from '@/lib/quotes';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuote(getRandomQuote());
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen || !quote) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full translate-x-1/2 translate-y-1/2" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="relative p-8 pt-12">
              {/* Quote icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg">
                  <QuoteIcon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-center text-yellow-400 font-semibold mb-6 text-lg">
                আজকের উক্তি
              </h3>

              {/* Quote text */}
              <div className="relative">
                <p className="text-white text-xl md:text-2xl text-center leading-relaxed font-medium mb-8">
                  "{quote.quote}"
                </p>
              </div>

              {/* Author info */}
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/10">
                {quote.authorImage ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400/50 shadow-lg">
                    <img
                      src={quote.authorImage}
                      alt={quote.authorName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {quote.authorName.charAt(0)}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-white font-semibold text-lg">{quote.authorName}</p>
                  {quote.authorDesignation && (
                    <p className="text-emerald-300 text-sm">{quote.authorDesignation}</p>
                  )}
                </div>
              </div>

              {/* Welcome message */}
              <div className="mt-8 text-center">
                <p className="text-emerald-200 text-sm">
                  অরিয়েটে স্বাগতম! আপনার শেখার যাত্রা শুভ হোক।
                </p>
              </div>

              {/* Continue button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-emerald-900 font-semibold rounded-full hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  চালিয়ে যান
                </button>
              </div>
            </div>
          </div>
        </div>
  );
}
