'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Users,
  Target,
  Globe2,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  Phone
} from 'lucide-react';
import Link from 'next/link';

const covers = [
  'https://res.cloudinary.com/di21cbkyf/image/upload/v1767133721/cover1_py8krf.webp',
  'https://res.cloudinary.com/di21cbkyf/image/upload/v1767134219/cover7_slr1bb.jpg',
  'https://res.cloudinary.com/di21cbkyf/image/upload/v1767133722/cover3_bvqbww.jpg',
  'https://res.cloudinary.com/di21cbkyf/image/upload/v1767133973/cover6_fut2x9.jpg',
  'https://res.cloudinary.com/di21cbkyf/image/upload/v1767134326/cover8_sh14az.webp',
  'https://res.cloudinary.com/di21cbkyf/image/upload/v1767134541/cover9_idqy7m.jpg'
];

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % covers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: 'Active Learners', value: '5,000+', icon: Users },
    { label: 'Global Mentors', value: '50+', icon: Globe2 },
    { label: 'Live Workshops', value: '100+', icon: BookOpen },
    { label: 'Countries Reached', value: '15+', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 bg-[#004aad] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 md:-mr-20 md:-mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-[#ff7620]/10 rounded-full blur-3xl -ml-10 -mb-10 md:-ml-20 md:-mb-20"></div>
        </div>
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Empowering Research <br className="hidden sm:block" /> & Innovation
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            ORIYET (Research Innovation and Youth Empowerment for Sustainability) is a global platform connecting aspiring researchers with world-class experts.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-20 lg:py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-orange-50 rounded-2xl transform -rotate-1 md:-rotate-2"></div>
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl bg-gray-100">
                {/* Image Slider */}
                {covers.map((src, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                  >
                    <Image
                      src={src}
                      alt={`ORIYET Event ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-[#ff7620] font-bold tracking-wider text-sm uppercase mb-2 block">Who We Are</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#004aad] mb-6">Our Mission</h2>
              <div className="prose prose-lg text-gray-600 mb-8 leading-relaxed">
                <p className="mb-4">
                  We bridge the gap between academic theory and practical research application. Our mission is to democratize access to high-quality research education, particularly in <strong className="text-gray-900">Bioinformatics, Nanotechnology, and Computational Biology</strong>.
                </p>
                <p>
                  By bringing together professors and scientists from top universities (USA, Europe, Asia), we provide students in developing regions with the mentorship and guidance needed to pursue higher studies and impactful research careers.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-orange-50/50 transition-colors">
                  <div className="p-3 bg-orange-50 rounded-xl text-[#ff7620] shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Skill Development</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Hands-on training in modern tools and methodologies.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50/50 transition-colors">
                  <div className="p-3 bg-blue-50 rounded-xl text-[#004aad] shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Global Network</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Connect with mentors and peers worldwide.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn from Experts Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C853] to-[#00A843]">Team</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate educators and technologists dedicated to transforming education.
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 items-start">

            {/* Member 1 - Staggered on Desktop only */}
            <div className="relative group md:pt-16">
              <div className="hidden md:flex absolute top-0 left-1/2 transform -translate-x-1/2 flex-col items-center z-10 transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-px h-12 bg-gray-300 border-l-2 border-dashed border-gray-400"></div>
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-md mt-[-2px]"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:-translate-y-1 relative z-0 h-full">
                <div className="p-6 text-center">
                  <div className="w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden shadow-md ring-4 ring-gray-50">
                    <Image
                      src="https://via.placeholder.com/150"
                      alt="Dr. Rauful Alam"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Dr. Rauful Alam</h3>
                  <p className="text-xs font-bold text-[#ff7620] uppercase tracking-wider mb-3">Co-founder</p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4 min-h-[4rem]">
                    Staff Scientist (Lead Medicinal Chemist)<br />
                    University of Chicago, USA
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                    <a href="#" className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:bg-[#0A66C2] hover:text-white transition-all"><Globe2 className="w-4 h-4" /></a>
                    <a href="#" className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:bg-[#0A66C2] hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Member 2 */}
            <div className="relative group md:pt-32">
              <div className="hidden md:flex absolute top-0 left-1/2 transform -translate-x-1/2 flex-col items-center z-10 transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-px h-28 bg-gray-300 border-l-2 border-dashed border-gray-400"></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-md mt-[-2px]"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:-translate-y-1 relative z-0 h-full">
                <div className="p-6 text-center">
                  <div className="w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden shadow-md ring-4 ring-gray-50">
                    <Image
                      src="https://via.placeholder.com/150"
                      alt="Dr. Azizul Haque"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Dr. Azizul Haque</h3>
                  <p className="text-xs font-bold text-[#ff7620] uppercase tracking-wider mb-3">Co-founder</p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4 min-h-[4rem]">
                    Assistant Professor<br />
                    Yeungnam University, Korea
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                    <a href="#" className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:bg-[#0A66C2] hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Member 3 */}
            <div className="relative group md:pt-16">
              <div className="hidden md:flex absolute top-0 left-1/2 transform -translate-x-1/2 flex-col items-center z-10 transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-px h-12 bg-gray-300 border-l-2 border-dashed border-gray-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-md mt-[-2px]"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:-translate-y-1 relative z-0 h-full">
                <div className="p-6 text-center">
                  <div className="w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden shadow-md ring-4 ring-gray-50">
                    <Image
                      src="https://via.placeholder.com/150"
                      alt="Team Member"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Demo Name</h3>
                  <p className="text-xs font-bold text-[#ff7620] uppercase tracking-wider mb-3">Advisor</p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4 min-h-[4rem]">
                    BDS, MDS - Periodontology<br />
                    14 Years Experience
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                    <a href="#" className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:bg-[#0A66C2] hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Member 4 */}
            <div className="relative group md:pt-24">
              <div className="hidden md:flex absolute top-0 left-1/2 transform -translate-x-1/2 flex-col items-center z-10 transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-px h-20 bg-gray-300 border-l-2 border-dashed border-gray-400"></div>
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-md mt-[-2px]"></div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:-translate-y-1 relative z-0 h-full">
                <div className="p-6 text-center">
                  <div className="w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden shadow-md ring-4 ring-gray-50">
                    <Image
                      src="https://via.placeholder.com/150"
                      alt="Team Member"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Demo Name</h3>
                  <p className="text-xs font-bold text-[#ff7620] uppercase tracking-wider mb-3">Advisor</p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4 min-h-[4rem]">
                    BDS, MDS - Periodontology<br />
                    16 Years Experience
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                    <a href="#" className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:bg-[#0A66C2] hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-[#004aad] text-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-14 h-14 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300 transform group-hover:scale-110">
                    <Icon className="w-7 h-7 text-[#ff7620]" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-blue-100 text-sm sm:text-base font-medium uppercase tracking-wide opacity-80">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#004aad] leading-tight">
              Ready to Start Researching?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
              Join ORIYET today and unlock access to expert-led workshops and global research opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full group relative px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff7620] to-[#ff8c42] hover:from-[#e06516] hover:to-[#ff7620] shadow-xl shadow-[#ff7620]/30 hover:shadow-2xl hover:shadow-[#ff7620]/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center overflow-hidden">
                  <span className="relative z-10 flex items-center">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              </Link>
              <Link href="/events" className="w-full sm:w-auto">
                <button className="w-full group px-8 py-4 rounded-xl font-bold text-[#004aad] bg-white border-2 border-[#004aad]/20 hover:border-[#004aad] hover:bg-gradient-to-r hover:from-[#004aad]/5 hover:to-[#004aad]/10 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#004aad]/20 hover:-translate-y-1 flex items-center justify-center gap-2">
                  Browse Events
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
