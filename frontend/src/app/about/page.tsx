'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Target,
  Globe2,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  GraduationCap,
  Network,
  Lightbulb,
  Shield,
  BookMarked,
  LineChart,
  ChevronLeft,
  ChevronRight
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
  const [teamSlide, setTeamSlide] = useState(0);
  const [isTeamHovered, setIsTeamHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % covers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll team carousel
  useEffect(() => {
    if (isTeamHovered) return;
    const timer = setInterval(() => {
      setTeamSlide((prev) => (prev + 1) % teamMembers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isTeamHovered]);

  const nextTeamSlide = useCallback(() => {
    setTeamSlide((prev) => (prev + 1) % teamMembers.length);
  }, []);

  const prevTeamSlide = useCallback(() => {
    setTeamSlide((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  }, []);

  const stats = [
    { label: 'Active Learners', value: '5,000+', icon: Users },
    { label: 'Global Mentors', value: '50+', icon: Globe2 },
    { label: 'Live Workshops', value: '100+', icon: BookOpen },
    { label: 'Countries Reached', value: '15+', icon: Target },
  ];

  // Team Members Data
  const teamMembers = [
    {
      name: 'Dr. Rauful Alam',
      role: 'Co-founder & Lead Scientist',
      description: 'Staff Scientist (Lead Medicinal Chemist) at University of Chicago, USA. Leading groundbreaking research in medicinal chemistry and drug discovery.',
      image: 'https://res.cloudinary.com/dzuqjiyjm/image/upload/v1768449989/oriyet/avatars/user-32-1768449988181.jpg',
      email: 'rauful.alam15@gmail.com',
      linkedin: 'https://www.linkedin.com/in/rauful-alam-phd-12536365/',
      googleScholar: 'https://scholar.google.com/citations?user=PrrE9dQAAAAJ&hl=en',
      orcid: '#',
      website: 'http://rauful-alam.blogspot.com/',
      cv: '#'
    },
    {
      name: 'Dr. Azizul Haque',
      role: 'Co-founder & Professor',
      description: 'Assistant Professor at Yeungnam University, Korea. Specializing in advanced research methodologies and academic excellence in higher education.',
      image: 'https://res.cloudinary.com/dzuqjiyjm/image/upload/v1768552891/azizul_oeuzta.jpg',
      email: 'azizul.bau10@gmail.com',
      linkedin: 'https://www.linkedin.com/in/azizul-haque-phd-740037109/',
      googleScholar: 'https://scholar.google.co.kr/citations?hl=en&user=xDbgVk4AAAAJ&view_op=list_works',
      orcid: 'https://orcid.org/0000-0002-5158-4558',
      website: 'https://www.haqueazizul.com/',
      cv: '#'
    },
    {
      name: 'Samia Malik',
      role: 'Host, Visual Designer, Emailing',
      description: 'Software Engineering student at Daffodil International University. Serves as host and visual designer at ORIYET, contributing to planning, coordination, and creative execution with innovative ideas.',
      image: 'https://res.cloudinary.com/dzuqjiyjm/image/upload/v1768576364/0_yn6uyu.png',
      email: 'samia.malik2003@gmail.com',
      linkedin: 'https://www.linkedin.com/in/samia-malik',
      googleScholar: '#',
      orcid: '#',
      website: '#',
      cv: '#'
    },
    {
      name: 'Kazi Sadia Akter',
      role: 'Host, Emailing, Social media manager',
      description: 'BSS student in Peace, Conflict & Human Rights at Bangladesh University of Professionals. Skilled in research, management, and event coordination with a focus on inclusive peacebuilding.',
      image: 'https://res.cloudinary.com/dzuqjiyjm/image/upload/v1768576545/o_fuysx7.png',
      email: 'kazisadiabushra@gmail.com',
      linkedin: 'https://www.linkedin.com/in/kazi-sadia-akter/',
      googleScholar: '#',
      orcid: '#',
      website: 'https://kazi-sadia-akter.lovable.app/',
      cv: 'https://drive.google.com/file/d/1GmJjmIZflTUsp_sxuVHxJldiYZrdfNVA/view?usp=sharing'
    },
    {
      name: 'Marzia Maherin',
      role: 'Host, Emailing, Social media manager',
      description: 'CSE student at Southeast University with a strong passion for technology and innovation. Known for adaptability, problem-solving mindset, and delivering high-quality work.',
      image: 'https://res.cloudinary.com/dzuqjiyjm/image/upload/v1768577172/0_ywwlqo.jpg',
      email: 'marziamaherin350@gmail.com',
      linkedin: 'https://www.linkedin.com/in/marzia-maherin-453400365',
      googleScholar: '#',
      orcid: '#',
      website: '#',
      cv: 'https://drive.google.com/file/d/18u7lXq3CzBmoNdKp8aSCIoNqe6h9QOgV/view?usp=sharing'
    }
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
          <span className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-semibold mb-6">
            About ORIYET
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            A Story of Hope, Resolve,
            <br className="hidden sm:block" />
            <span className="text-[#ff7620]">and a New Beginning</span>
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-orange-400 font-bold mb-4">
            জাগো বাংলাদেশ, জ্ঞান-গবেষণায়, আবিষ্কার-উদ্ভাবনে
          </p>
          <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            ORIYET (Research Innovation and Youth Empowerment for Sustainability) is a global platform connecting aspiring researchers with world-class experts.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Story Content */}
          <div className="space-y-6 sm:space-y-8 text-lg text-gray-700 leading-relaxed">
            <p className="text-center text-lg sm:text-xl md:text-2xl text-gray-800 font-medium leading-relaxed">
              Every great movement starts with a question. For us, it was simple yet powerful:{' '}
              <span className="font-bold text-blue-600 italic block mt-2 sm:inline sm:mt-0">
                "Why do thousands of brilliant young minds in Bangladesh fall through the cracks?"
              </span>
            </p>

            <p className="text-center text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
              Why do talented students lose direction? Why do researchers struggle without mentorship, guidance, or access?
              Why do educators and scientists abroad feel a deep desire to contribute but lack a structured bridge to connect back home?
            </p>

            <p className="text-center text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
              These questions echoed across continents inside research labs in the <span className="font-semibold text-gray-800">United States</span>, classrooms in <span className="font-semibold text-gray-800">Europe</span>,
              offices in <span className="font-semibold text-gray-800">Asia</span>, and homes throughout <span className="font-semibold text-gray-800">Bangladesh</span>. A group of passionate scientists, scholars, and professionals
              kept meeting, discussing, and dreaming.
            </p>

            {/* Vision Card */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border-2 border-blue-100 my-8 sm:my-12">
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center">
                Slowly, a shared vision took shape:
              </p>
              <ul className="space-y-4 sm:space-y-5">
                <li className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-gray-800 text-base sm:text-lg md:text-xl font-medium group-hover:text-blue-600 transition-colors duration-300">
                    A connected platform where knowledge flows freely.
                  </span>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-gray-800 text-base sm:text-lg md:text-xl font-medium group-hover:text-orange-600 transition-colors duration-300">
                    A community that empowers youth.
                  </span>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-gray-800 text-base sm:text-lg md:text-xl font-medium group-hover:text-blue-600 transition-colors duration-300">
                    A movement that rebuilds the research culture of Bangladesh.
                  </span>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-gray-800 text-base sm:text-lg md:text-xl font-medium group-hover:text-orange-600 transition-colors duration-300">
                    A commitment to sustainability so progress lasts, and keeps growing.
                  </span>
                </li>
              </ul>
            </div>

            {/* Concluding Statement */}
            <div className="text-center pt-8">
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-snug mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600">
                  This dream became ORIYET
                </span>
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed">
                The Organization for Research, Innovation,{' '}
                <span className="text-orange-600 font-bold block sm:inline">
                  Youth Empowerment
                </span>
                , and Sustainability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-5 py-2 rounded-full bg-[#004aad]/10 text-[#004aad] text-sm font-semibold mb-4">
              Our Direction
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Vision & Mission
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Building a sustainable, research-driven ecosystem for Bangladeshi youth
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Vision */}
            <div className="bg-gradient-to-br from-[#004aad] to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,74,173,0.4)] transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-white/15 transition-colors duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Target className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold">Our Vision</h3>
                </div>
                <p className="text-base sm:text-lg leading-relaxed text-blue-50 mb-8 group-hover:text-white transition-colors duration-300">
                  To build a globally connected, research-driven generation of Bangladeshi youth who are empowered with knowledge,
                  inspired to innovate, and equipped to shape a sustainable future for Bangladesh. We envision a nation where research
                  is celebrated, collaboration is easy, and young people can thrive no matter where they come from.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7620] group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs sm:text-sm font-semibold text-white/90">Focus</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold">Youth Empowerment</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7620] group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs sm:text-sm font-semibold text-white/90">Impact</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold">National Growth</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7620] group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs sm:text-sm font-semibold text-white/90">Method</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold">Research-Driven</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7620] group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-xs sm:text-sm font-semibold text-white/90">Goal</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold">Sustainability</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-blue-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#ff7620] to-[#e06516] flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#004aad]">Our Mission</h3>
              </div>
              <ul className="space-y-4 sm:space-y-6">
                {[
                  { id: 1, title: 'Strengthen Research Culture', desc: 'Cultivate a strong scientific and academic ecosystem through seminars, workshops, courses, and mentorship.', color: 'blue' },
                  { id: 2, title: 'Empower Youth with Knowledge', desc: 'Provide guidance on scholarships, higher education, research training, and professional growth.', color: 'orange' },
                  { id: 3, title: 'Connect Global Experts', desc: 'Bridge between Bangladeshi students and the global scientific community.', color: 'blue' },
                  { id: 4, title: 'Build Sustainable Initiatives', desc: 'Create educational structures through university partnerships and long-term training programs.', color: 'orange' },
                  { id: 5, title: 'Ensure Accessibility', desc: 'Make high-quality education accessible to students from all backgrounds.', color: 'blue' },
                ].map((item) => (
                  <li key={item.id} className="group flex items-start gap-4 hover:translate-x-2 transition-transform duration-300">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${item.color === 'blue' ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} flex items-center justify-center flex-shrink-0 mt-1 shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                      <span className="font-bold text-white text-base sm:text-lg">{item.id}</span>
                    </div>
                    <div>
                      <h4 className={`font-bold text-gray-900 mb-1 text-base sm:text-lg group-hover:text-${item.color === 'blue' ? 'blue' : 'orange'}-600 transition-colors duration-300`}>{item.title}</h4>
                      <p className="text-gray-600 text-sm sm:text-base group-hover:text-gray-700 transition-colors duration-300">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>



      {/* Image Gallery Section */}
      <section className="py-12 md:py-20 lg:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-5 py-2 rounded-full bg-[#004aad]/10 text-[#004aad] text-sm font-semibold mb-4">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#004aad] mb-6">ORIYET in Action</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Glimpses from our events, workshops, and community gatherings
            </p>
          </div>
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
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Building Connections, Creating Impact</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                From interactive workshops to inspiring seminars, ORIYET brings together students, researchers, and global experts.
                Our events foster collaboration, ignite curiosity, and pave the way for groundbreaking research and innovation.
              </p>
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


      {/* Meet Our Team Section - 3D Carousel */}
      <section 
        className="w-full relative overflow-hidden py-16 sm:py-24 bg-gray-50"
        onMouseEnter={() => setIsTeamHovered(true)}
        onMouseLeave={() => setIsTeamHovered(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center pb-12">
            <span className="inline-block px-5 py-2 rounded-full bg-[#004aad]/10 text-[#004aad] text-sm font-semibold mb-4">
              Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#004aad] mb-4">
              Meet the Passionate Minds
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Researchers, educators, and innovators dedicated to empowering the next generation
            </p>
          </div>

          {/* 3D Carousel - Show only 3 cards */}
          <div className="relative h-[480px] md:h-[520px]" style={{ perspective: '1200px' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              {teamMembers.map((member, index) => {
                // Calculate the offset from current slide
                let offset = index - teamSlide;
                
                // Handle wrap-around for infinite loop
                if (offset > teamMembers.length / 2) offset -= teamMembers.length;
                if (offset < -teamMembers.length / 2) offset += teamMembers.length;
                
                // Only show 3 cards: -1, 0, +1
                const isVisible = Math.abs(offset) <= 1;
                if (!isVisible) return null;

                const isActive = offset === 0;
                
                // Position calculations for 3-card display
                let translateX = offset * 320;
                let translateZ = isActive ? 50 : -100;
                let rotateY = offset * -15;
                let scale = isActive ? 1 : 0.85;
                let opacity = isActive ? 1 : 0.7;
                let zIndex = isActive ? 30 : 20;

                return (
                  <div
                    key={index}
                    className="absolute transition-all duration-700 ease-out cursor-pointer"
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      opacity,
                      zIndex,
                      transformStyle: 'preserve-3d',
                    }}
                    onClick={() => setTeamSlide(index)}
                  >
                    <div className={`w-[280px] md:w-[340px] bg-white rounded-2xl overflow-hidden shadow-xl ${isActive ? 'ring-2 ring-[#ff7620] shadow-2xl' : 'shadow-lg'} transition-shadow duration-300`}>
                      {/* Image */}
                      <div className="relative h-[260px] md:h-[300px] overflow-hidden">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        
                        {/* Name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                            {member.name}
                          </h3>
                          <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-[#ff7620] to-[#ff8c42] rounded-full">
                            {member.role}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content - Only show on active */}
                      {isActive && (
                        <div className="p-4 space-y-3 bg-white">
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {member.description}
                          </p>
                          
                          {/* Social Links */}
                          <div className="flex justify-center gap-2 pt-2 border-t border-gray-100">
                            {member.email && member.email !== '#' && (
                              <a href={`mailto:${member.email}`} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-white hover:bg-[#EA4335] transition-all duration-300" title="Email">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                              </a>
                            )}
                            {member.linkedin && member.linkedin !== '#' && (
                              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-white hover:bg-[#0A66C2] transition-all duration-300" title="LinkedIn">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                              </a>
                            )}
                            {member.googleScholar && member.googleScholar !== '#' && (
                              <a href={member.googleScholar} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-white hover:bg-[#4285F4] transition-all duration-300" title="Google Scholar">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
                              </a>
                            )}
                            {member.orcid && member.orcid !== '#' && (
                              <a href={member.orcid} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-white hover:bg-[#A6CE39] transition-all duration-300" title="ORCID">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z"/></svg>
                              </a>
                            )}
                            {member.website && member.website !== '#' && (
                              <a href={member.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-white hover:bg-[#004aad] transition-all duration-300" title="Website">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                              </a>
                            )}
                            {member.cv && member.cv !== '#' && (
                              <a href={member.cv} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:text-white hover:bg-[#ff7620] transition-all duration-300" title="CV">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevTeamSlide}
              className="p-3 rounded-full bg-[#004aad] text-white hover:bg-[#003a8c] transition-all duration-300 shadow-lg"
              aria-label="Previous team member"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Dots indicator */}
            <div className="flex items-center gap-2">
              {teamMembers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setTeamSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === teamSlide 
                      ? 'w-8 h-3 bg-gradient-to-r from-[#ff7620] to-[#ff8c42]' 
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to team member ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTeamSlide}
              className="p-3 rounded-full bg-[#004aad] text-white hover:bg-[#003a8c] transition-all duration-300 shadow-lg"
              aria-label="Next team member"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
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
