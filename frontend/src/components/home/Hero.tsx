'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Zap, BookOpen, Target, Award, Globe, Lightbulb, Users } from 'lucide-react';

const covers = [
    'https://res.cloudinary.com/di21cbkyf/image/upload/v1767133721/cover1_py8krf.webp',
    'https://res.cloudinary.com/di21cbkyf/image/upload/v1767134219/cover7_slr1bb.jpg',
    'https://res.cloudinary.com/di21cbkyf/image/upload/v1767133722/cover3_bvqbww.jpg',
    'https://res.cloudinary.com/di21cbkyf/image/upload/v1767133973/cover6_fut2x9.jpg',
    'https://res.cloudinary.com/di21cbkyf/image/upload/v1767134326/cover8_sh14az.webp',
    'https://res.cloudinary.com/di21cbkyf/image/upload/v1767134541/cover9_idqy7m.jpg'
];

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % covers.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-gray-900">
            {/* Background Slider */}
            <div className="absolute inset-0 z-0">
                {covers.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <Image
                            src={src}
                            alt={`Hero Background ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                        {/* Enhanced Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 relative z-10 w-full">
                <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
                    {/* Content Container */}
                    <div className="space-y-6 sm:space-y-8 animate-fade-in-up flex flex-col items-center">

                        {/* Badge - Responsive padding/font */}
                        <div className="hidden xs:inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mb-2 sm:mb-0">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                            <span className="text-xs sm:text-sm font-semibold text-white">Empowering 10,000+ Students Nationwide</span>
                        </div>

                        {/* Main Heading - Better mobile scaling */}
                        <div className="space-y-2 sm:space-y-4">
                            <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white drop-shadow-2xl">
                                <span className="block">
                                    Empowering Youth Through
                                </span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 pb-2">
                                    Research & Innovation
                                </span>
                            </h1>
                        </div>

                        {/* Description - Responsive text size/width */}
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 leading-relaxed max-w-3xl mx-auto font-medium drop-shadow-lg px-2 sm:px-0">
                            Join Bangladesh's leading platform connecting students, researchers, and global experts to build a sustainable future through education and collaboration.
                        </p>

                        {/* CTA Buttons - Full width on mobile, row on larger */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 w-full sm:w-auto px-4 sm:px-0">
                            <Link href="/register" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-base sm:text-lg shadow-[0_10px_40px_-10px_rgba(255,118,32,0.6)] hover:shadow-[0_20px_50px_-10px_rgba(255,118,32,0.8)] hover:-translate-y-1 transition-all duration-300 overflow-hidden min-h-[48px]">
                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>

                                    <Zap className="w-5 h-5 relative z-10" />
                                    <span className="relative z-10">Get Started Free</span>
                                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                                </button>
                            </Link>
                            <Link href="/events" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 hover:border-white rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-md hover:-translate-y-1 min-h-[48px]">
                                    <BookOpen className="w-5 h-5" />
                                    Browse Events
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                                </button>
                            </Link>
                        </div>

                        {/* Core Values - Single line layout */}
                        <div className="flex flex-row justify-center items-start gap-4 sm:gap-12 pt-8 max-w-5xl mx-auto w-full mt-4 bg-white/5 sm:bg-transparent rounded-2xl sm:rounded-none p-4 sm:p-0">
                            <div className="flex flex-col items-center group cursor-default flex-1 text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-all duration-300 border border-white/20 group-hover:scale-110">
                                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 group-hover:text-blue-200" />
                                </div>
                                <div className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1 group-hover:text-blue-200 transition-colors leading-tight">Global Network</div>
                                <div className="text-[10px] sm:text-sm text-gray-300 font-medium text-center leading-tight">Connecting minds worldwide</div>
                            </div>
                            <div className="flex flex-col items-center group cursor-default flex-1 text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-all duration-300 border border-white/20 group-hover:scale-110">
                                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 group-hover:text-yellow-200" />
                                </div>
                                <div className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1 group-hover:text-yellow-200 transition-colors leading-tight">Innovation Hub</div>
                                <div className="text-[10px] sm:text-sm text-gray-300 font-medium text-center leading-tight">Fostering creative solutions</div>
                            </div>
                            <div className="flex flex-col items-center group cursor-default flex-1 text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-white/20 transition-all duration-300 border border-white/20 group-hover:scale-110">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-300 group-hover:text-orange-200" />
                                </div>
                                <div className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1 group-hover:text-orange-200 transition-colors leading-tight">Youth Leadership</div>
                                <div className="text-[10px] sm:text-sm text-gray-300 font-medium text-center leading-tight">Empowering future leaders</div>
                            </div>
                        </div>

                        {/* Feature Badges - Hidden on small mobile */}
                        <div className="hidden sm:flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-4">
                            <div className="group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-default">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-white">Quick Learning</span>
                            </div>
                            <div className="group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-default">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <Award className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-white">Certified</span>
                            </div>
                            <div className="group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-default">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                    <Target className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-white">Expert-Led</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slider Indicators */}
            <div className="absolute bottom-5 sm:bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                {covers.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-6 sm:w-8' : 'bg-white/40 w-1.5 sm:w-2 hover:bg-white/60'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
