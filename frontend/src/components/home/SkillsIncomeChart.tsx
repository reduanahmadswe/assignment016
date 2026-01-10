'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, GraduationCap, Sparkles, ArrowUpRight, Briefcase } from 'lucide-react';

// Bangladesh Education vs Income Data
// Source: Bangladesh Bureau of Statistics (BBS) Labour Force Survey 2022-23
interface EducationLevel {
  level: string;
  shortName: string;
  monthlyIncome: number;
  employmentRate: number;
  multiplier: number;
  color: string;
  icon: string;
}

// Using ORIYET brand colors: Blue #2563EB, Purple #7C3AED, Orange #EA580C
const educationData: EducationLevel[] = [
  { level: 'No Formal Education', shortName: 'None', monthlyIncome: 12500, employmentRate: 48, multiplier: 1.0, color: '#94a3b8', icon: '📭' },
  { level: 'Primary (Class 1-5)', shortName: 'Primary', monthlyIncome: 15800, employmentRate: 54, multiplier: 1.26, color: '#60a5fa', icon: '📕' },
  { level: 'Secondary (SSC)', shortName: 'SSC', monthlyIncome: 19500, employmentRate: 58, multiplier: 1.56, color: '#3b82f6', icon: '📗' },
  { level: 'Higher Secondary (HSC)', shortName: 'HSC', monthlyIncome: 25000, employmentRate: 64, multiplier: 2.0, color: '#2563EB', icon: '📘' },
  { level: "Bachelor's Degree", shortName: "Bachelor's", monthlyIncome: 38000, employmentRate: 72, multiplier: 3.04, color: '#7C3AED', icon: '🎓' },
  { level: "Master's Degree", shortName: "Master's", monthlyIncome: 55000, employmentRate: 82, multiplier: 4.4, color: '#6D28D9', icon: '📚' },
  { level: 'PhD / Professional', shortName: 'PhD', monthlyIncome: 95000, employmentRate: 94, multiplier: 7.6, color: '#EA580C', icon: '🏆' },
];

export default function SkillsIncomeChart() {
  const [isVisible, setIsVisible] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      setAnimationProgress(0);
      const timer = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 1.5;
        });
      }, 12);

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  const maxIncome = Math.max(...educationData.map(d => d.monthlyIncome));

  return (
    <section ref={chartRef} className="py-20 sm:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - ORIYET Style */}
        <div className="text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 text-sm font-semibold mb-6 shadow-sm border border-primary-200/50">
            <span className="text-xl">🇧🇩</span>
            Bangladesh Real Data
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-5 tracking-tight">
            More Learning = <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">More Earning</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            See how education directly increases your income potential in Bangladesh
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-10">
          
          {/* Chart Card */}
          <div className="xl:col-span-2 bg-white rounded-2xl p-6 sm:p-10 shadow-xl border border-gray-100">
            {/* Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl shadow-lg shadow-primary-500/25">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                Monthly Income by Education
              </h3>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-4 py-2.5 rounded-full">
                📊 BBS Labour Force Survey 2022-23
              </span>
            </div>

            {/* Chart Container */}
            <div className="relative h-[420px] sm:h-[480px]">
              {/* Y-Axis */}
              <div className="absolute left-0 top-4 bottom-20 w-14 flex flex-col justify-between items-end pr-3">
                {['৳95k', '৳75k', '৳50k', '৳25k', '৳0'].map((label, i) => (
                  <span key={i} className="text-xs sm:text-sm font-semibold text-gray-400">{label}</span>
                ))}
              </div>

              {/* Chart Area */}
              <div className="ml-16 sm:ml-20 h-full relative">
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map((percent) => (
                  <div
                    key={percent}
                    className="absolute left-0 right-0 border-t border-dashed border-gray-100"
                    style={{ bottom: `${percent * 0.72 + 18}%` }}
                  />
                ))}

                {/* Bars */}
                <div className="absolute inset-x-0 bottom-0 top-4 flex items-end justify-between gap-3 sm:gap-5 pb-20">
                  {educationData.map((data, index) => {
                    const barHeight = (data.monthlyIncome / maxIncome) * 75;
                    const animatedHeight = (barHeight * animationProgress) / 100;
                    const isHovered = hoveredBar === index;
                    const delay = index * 80;

                    return (
                      <div
                        key={data.level}
                        className="flex flex-col items-center flex-1 h-full justify-end group"
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {/* Tooltip */}
                        <div
                          className={`absolute z-50 px-5 py-4 bg-gray-900 text-white rounded-xl shadow-2xl transition-all duration-300 min-w-[200px] ${
                            isHovered ? 'opacity-100 visible -translate-y-3' : 'opacity-0 invisible translate-y-0'
                          }`}
                          style={{ 
                            bottom: `${Math.min(animatedHeight + 22, 85)}%`,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{data.icon}</span>
                            <span className="font-bold text-base">{data.level}</span>
                          </div>
                          <div className="text-accent-400 font-bold text-xl mb-2">
                            ৳{data.monthlyIncome.toLocaleString()}/month
                          </div>
                          <div className="flex justify-between text-sm text-gray-300 pt-2 border-t border-gray-700">
                            <span>Employment: <span className="text-white font-semibold">{data.employmentRate}%</span></span>
                          </div>
                          <div className="text-secondary-400 font-bold mt-2 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {data.multiplier}x income boost
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 rotate-45" />
                        </div>

                        {/* Bar */}
                        <div
                          className="relative w-full max-w-[56px] sm:max-w-[68px] rounded-xl cursor-pointer transition-all duration-500 ease-out"
                          style={{
                            height: `${animatedHeight}%`,
                            background: `linear-gradient(180deg, ${data.color}ee 0%, ${data.color} 100%)`,
                            minHeight: animatedHeight > 0 ? '60px' : '0',
                            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                            boxShadow: isHovered 
                              ? `0 20px 40px ${data.color}40, 0 0 0 4px ${data.color}20`
                              : `0 8px 20px ${data.color}25`,
                            transitionDelay: `${delay}ms`,
                          }}
                        >
                          {/* Glossy overlay */}
                          <div className="absolute inset-0 rounded-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/10" />
                            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent rounded-t-xl" />
                          </div>
                          
                          {/* Income on bar */}
                          <div className="absolute top-4 inset-x-0 text-center">
                            <span className="text-sm sm:text-base font-black text-white drop-shadow-lg">
                              ৳{(data.monthlyIncome / 1000).toFixed(0)}k
                            </span>
                          </div>

                          {/* Multiplier Badge */}
                          {data.multiplier > 1 && animatedHeight > 25 && (
                            <div className="absolute bottom-4 inset-x-0 text-center">
                              <span className="inline-block text-[11px] sm:text-xs font-bold text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                                {data.multiplier}x
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Icon */}
                        <div 
                          className={`text-2xl sm:text-3xl mt-3 transition-all duration-500 ${isHovered ? 'scale-125 -translate-y-1' : ''}`}
                          style={{ 
                            opacity: animationProgress > 60 ? 1 : 0,
                            transitionDelay: `${delay + 300}ms`
                          }}
                        >
                          {data.icon}
                        </div>

                        {/* Label */}
                        <span className={`mt-2 text-xs sm:text-sm font-bold transition-colors ${isHovered ? 'text-primary-600' : 'text-gray-500'}`}>
                          {data.shortName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Section - Insight + Quick Facts + Data Source */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Insight Box */}
              <div className="lg:col-span-1 p-5 sm:p-6 bg-gradient-to-br from-primary-50 via-primary-50/50 to-secondary-50/30 rounded-xl border border-primary-100">
                <div className="flex flex-col h-full">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl shadow-lg shadow-primary-500/30 w-fit mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-black text-gray-900 text-lg mb-2">The Power of Education</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    A <span className="font-bold text-secondary-600">PhD holder earns 7.6x more</span> than someone with no education. 
                    Even a <span className="font-bold text-primary-600">Bachelor's = 3x income</span>!
                  </p>
                </div>
              </div>

              {/* Quick Facts */}
              <div className="lg:col-span-1 p-5 sm:p-6 bg-gradient-to-br from-secondary-50 to-primary-50/30 rounded-xl border border-secondary-100">
                <h4 className="font-bold text-sm uppercase tracking-widest text-secondary-600 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Quick Facts
                </h4>
                <ul className="space-y-3">
                  {[
                    'Each level adds ~৳5-15k/month',
                    "Master's = 46% more employment",
                    'Skills boost income 20-40%',
                  ].map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-primary-500 text-base leading-none mt-0.5">✓</span>
                      <span className="leading-snug">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data Source */}
              <div className="lg:col-span-1 p-5 sm:p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-2">📊 Data Source</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Bangladesh Bureau of Statistics (BBS) Labour Force Survey 2022-23 & World Bank Development Indicators.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-[11px] text-gray-400">Last updated: 2023 | Sample: 100k+ households</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Income Multiplier Card - ORIYET Theme */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-600 to-secondary-700 rounded-2xl p-7 text-white shadow-2xl shadow-primary-600/30 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary-400/20 rounded-full blur-2xl" />
              
              <h4 className="relative font-bold text-sm uppercase tracking-widest text-primary-200 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Income Multiplier
              </h4>
              <div className="relative space-y-5">
                {educationData.slice(3).map((data) => (
                  <div key={data.level} className="flex items-center justify-between group hover:bg-white/10 -mx-3 px-3 py-2 rounded-xl transition-colors">
                    <span className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{data.icon}</span>
                      <span className="font-semibold">{data.shortName}</span>
                    </span>
                    <span className="font-black text-2xl text-accent-400">{data.multiplier}x</span>
                  </div>
                ))}
              </div>
              <div className="relative mt-6 pt-5 border-t border-white/20 text-sm text-primary-200">
                📌 vs. no formal education baseline
              </div>
            </div>

            {/* Employment Rate Card */}
            <div className="bg-white rounded-2xl p-7 shadow-xl border border-gray-100">
              <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-primary-100 rounded-xl">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                </div>
                Employment Rate
              </h4>
              <div className="space-y-5">
                {[
                  { label: 'No Education', value: 48, color: 'bg-gray-400' },
                  { label: "Bachelor's", value: 72, color: 'bg-primary-500' },
                  { label: 'PhD/Professional', value: 94, color: 'bg-secondary-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                    </div>
                    <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${(item.value * animationProgress) / 100}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button - ORIYET Orange Accent */}
            <a
              href="/events"
              className="group block bg-gradient-to-r from-accent-500 via-accent-500 to-accent-600 rounded-2xl p-7 text-white shadow-2xl shadow-accent-500/30 hover:shadow-accent-500/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <h4 className="font-bold text-xl mb-2 flex items-center gap-2">
                  Boost Your Skills Now
                  <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </h4>
                <p className="text-sm text-orange-100">
                  Join ORIYET workshops & increase your earning potential 🚀
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
