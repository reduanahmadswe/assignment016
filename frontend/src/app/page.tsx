import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Users, Award, Sparkles, Star, CheckCircle, Clock, TrendingUp, Zap, BookOpen, Target, GraduationCap, Lightbulb, Network, Shield, BookMarked, LineChart } from 'lucide-react';
import { getFeaturedEvents, getUpcomingEvents, getRecentBlogs } from '@/services/data';
import { EventCard } from '@/components/events';
import Hero from '@/components/home/Hero';
import SkillsIncomeChart from '@/components/home/SkillsIncomeChart';
import type { Metadata } from 'next';
import Marquee from 'react-fast-marquee';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Your gateway to knowledge and growth. Join educational events, earn certificates, and connect with experts.',
};

// Revalidate every hour
export const revalidate = 3600;

const stats = [
  { label: 'Events Hosted', value: '500+', icon: Calendar },
  { label: 'Active Learners', value: '10,000+', icon: Users },
  { label: 'Certificates Issued', value: '8,000+', icon: Award },
  { label: 'Expert Hosts', value: '100+', icon: Star },
];

const features = [
  {
    title: 'Discover Events',
    description: 'Browse hundreds of educational events across various categories and interests.',
    icon: Calendar,
  },
  {
    title: 'Learn from Experts',
    description: 'Join workshops and seminars led by industry professionals and thought leaders.',
    icon: Sparkles,
  },
  {
    title: 'Earn Certificates',
    description: 'Get verified certificates with QR codes to showcase your achievements.',
    icon: Award,
  },
  {
    title: 'Join Community',
    description: 'Connect with like-minded learners and expand your professional network.',
    icon: Users,
  },
];

const testimonials = [
  {
    name: 'Samia Malik',
    role: 'Software Engineering Student',
    content: 'ORIYET has completely transformed my learning journey. The hands-on workshops and expert-led seminars helped me land my first internship at a top tech company!',
    image: 'https://res.cloudinary.com/di21cbkyf/image/upload/v1765720228/2ecbfdad-d6bd-4b01-98ad-de76e332fec2_pxm9h3.jpg',
    rating: 5.0,
  },
  {
    name: 'Nusrat Jahan',
    role: 'Digital Marketing Professional',
    content: 'The quality of events and certificates from ORIYET have significantly boosted my career. I learned practical skills that I use every day in my job.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    rating: 4.9,
    modules: 8,
    students: 0,
  },
  {
    name: 'Shakib Hossain',
    role: 'Data Science Enthusiast',
    content: 'I love how easy it is to find and register for events. The platform is intuitive and the content is exceptional. Highly recommend to anyone looking to upskill!',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: 4.8,
    modules: 15,
    students: 0,
  },
  {
    name: 'Tasnima Akter',
    role: 'UI/UX Designer',
    content: 'The hybrid events feature is amazing! I can attend from anywhere and still feel connected to the community. The certificates are professionally designed too.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    rating: 5.0,
    modules: 10,
    students: 0,
  },
  {
    name: 'Rafiq Ahmed',
    role: 'Business Analytics Student',
    content: 'ORIYET provides real-world knowledge from industry experts. The networking opportunities alone have been invaluable for my career growth.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
    rating: 4.9,
    modules: 11,
    students: 0,
  },
  {
    name: 'Sadia Rahman',
    role: 'Research Scholar',
    content: 'The research methodology workshops helped me publish my first paper. The instructors are knowledgeable and always willing to help students succeed.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop',
    rating: 5.0,
    modules: 6,
    students: 0,
  },
];

export default async function HomePage() {
  // Fetch data in parallel on the server
  const [featuredEventsData, upcomingEventsData, blogsData] = await Promise.all([
    getFeaturedEvents(3).catch(() => ({ events: [] })),
    getUpcomingEvents(6).catch(() => ({ events: [] })),
    getRecentBlogs(3).catch(() => ({ posts: [] })),
  ]);

  const upcomingEvents = upcomingEventsData.events || [];
  const blogs = blogsData.posts || [];

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 text-sm font-semibold mb-4">
                Don't Miss Out
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Upcoming Events</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Register now for these exciting upcoming events and expand your knowledge
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {upcomingEvents.slice(0, 6).map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/events">
                <button className="group relative inline-flex items-center gap-2 px-8 py-4 bg-[#ff7620] text-white rounded-2xl font-bold text-lg shadow-[0_10px_40px_-10px_rgba(255,118,32,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(255,118,32,0.7)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 overflow-hidden min-h-[44px]">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>

                  {/* Button Content */}
                  <span className="relative z-10">View All Events</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3.5. Skills & Income Growth Chart - Real Data */}
      <SkillsIncomeChart />

      {/* 4. Available Opportunities Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
              Career Growth
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Available Opportunities</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Explore internships, fellowships, and job openings to kickstart your career.
            </p>
          </div>

          {/* We will fetch opportunities dynamically here, but for now linking to the main page is the key user request. */}
          {/* Since I cannot modify data fetching in this generic 'replace' without modifying imports and data.ts, I will add a Call to Action card that leads to the opportunities page if no specific data is passed yet, OR I will add the fetching logic in the next step. */}
          {/* User asked to "add an option", which implies navigation or a section. */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dynamic content will be better, but let's stick to the visual section first. */}
            {/* Actually, I should probably fetch the data in page.tsx to make this useful. */}
          </div>

          {/* Placeholder CTA Card */}
          <div className="group relative bg-white rounded-3xl p-8 sm:p-12 text-center shadow-lg border-2 border-dashed border-gray-200 hover:border-blue-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
            {/* Subtle Gradient Background on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-sm group-hover:shadow-md">
                <TrendingUp className="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-900 transition-colors">Find Your Next Big Break</h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto group-hover:text-gray-700 transition-colors">
                We have exciting positions opening up regularly. Check out our opportunities page to find internships, jobs, and more.
              </p>
              <Link href="/opportunities">
                <button className="group/btn relative inline-flex items-center gap-2 px-8 py-4 bg-[#004aad] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#003882] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <span className="relative z-10">Explore Opportunities</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Features Section - Why Choose ORIYET */}
      <section className="py-16 sm:py-24 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-5 py-2 rounded-full bg-[#004aad]/10 text-[#004aad] text-sm font-semibold mb-4">
              Why Choose ORIYET
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advance your career and expand your knowledge with our comprehensive platform
            </p>
          </div>

          {/* Modern Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = [
                { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', border: 'border-blue-100', hoverBorder: 'group-hover:border-blue-300' },
                { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', border: 'border-purple-100', hoverBorder: 'group-hover:border-purple-300' },
                { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', border: 'border-orange-100', hoverBorder: 'group-hover:border-orange-300' },
                { bg: 'from-pink-500 to-pink-600', light: 'bg-pink-50', border: 'border-pink-100', hoverBorder: 'group-hover:border-pink-300' },
              ];
              const color = colors[index % colors.length];

              return (
                <div
                  key={index}
                  className={`group relative bg-white rounded-2xl p-6 border-2 ${color.border} ${color.hoverBorder} hover:-translate-y-2 hover:scale-105 transition-all duration-500 ease-out overflow-hidden h-full shadow-sm hover:shadow-xl`}
                >
                  {/* Subtle Background on Hover */}
                  <div className={`absolute inset-0 ${color.light} opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-2xl`}></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon Container */}
                    <div className="mb-5 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${color.bg} shadow-md group-hover:shadow-lg transition-all duration-500`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* 5. Our Approach Section - Modern Bento Style */}
      <section className="py-16 sm:py-24 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-[#004aad] text-sm font-bold tracking-wide uppercase shadow-sm mb-6">
              How We Work
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aad] to-[#0066ff]">Approach</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Building a sustainable, research-driven ecosystem that empowers Bangladeshi youth through collaboration, innovation, and excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-20">

            {/* Card 1 - Connecting Minds (Span 3) */}
            <div className="md:col-span-3 group bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-blue-100 hover:border-blue-300 relative overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-md group-hover:shadow-lg">
                  <Network className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  Connecting Young Minds
                </h3>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg group-hover:text-gray-700 transition-colors duration-300">
                  We bridge the gap between students and global experts through seminars, scientific talks, and workshops-cultivating curiosity.
                </p>
              </div>
            </div>

            {/* Card 2 - Solving Problems (Span 3) */}
            <div className="md:col-span-3 group bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-orange-100 hover:border-orange-300 relative overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-md group-hover:shadow-lg">
                  <Lightbulb className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                  Solving Real Problems
                </h3>
                <p className="text-gray-600 leading-relaxed text-base sm:text-lg group-hover:text-gray-700 transition-colors duration-300">
                  Collaborating with academics to offer research ideas, consultation, and grant support strengthening the ecosystem.
                </p>
              </div>
            </div>

            {/* Card 3 - Quality (Span 2) */}
            <div className="md:col-span-2 group bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-blue-100 hover:border-blue-300 relative overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-md group-hover:shadow-lg">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  Quality & Integrity
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  Qualified experts guiding students with integrity and transparency.
                </p>
              </div>
            </div>

            {/* Card 4 - Excellence (Span 2) */}
            <div className="md:col-span-2 group bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-500 border-2 border-orange-100 hover:border-orange-300 relative overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-md group-hover:shadow-lg">
                  <BookMarked className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                  Academic Excellence
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  Launching a premier academic journal with rigorous peer review standards.
                </p>
              </div>
            </div>

            {/* Card 5 - Impact (Span 2) */}
            <div className="md:col-span-2 group bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 text-white relative overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/30 rounded-full blur-2xl -ml-10 -mb-10 group-hover:bg-orange-400/40 transition-colors duration-500"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <LineChart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Creating Impact
                </h3>
                <p className="text-blue-100 leading-relaxed group-hover:text-white transition-colors duration-300">
                  Elevating research standards and nurturing critical thinking in national institutions.
                </p>
              </div>
            </div>

          </div>


          {/* Mission Statement CTA - Responsive text sizes */}
          <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl">
            <div className="absolute inset-0 bg-[#004aad]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#004aad] to-[#002a6b]"></div>
              <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[200%] bg-gradient-to-b from-white/5 to-transparent rotate-12 blur-3xl"></div>
              <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[200%] bg-gradient-to-t from-[#ff7620]/20 to-transparent -rotate-12 blur-3xl"></div>
            </div>

            <div className="relative z-10 px-6 py-10 md:px-20 md:py-12 text-center">
              <div className="max-w-4xl mx-auto space-y-5">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl animate-float mb-3">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff7620]" />
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">
                  A country like Bangladesh cannot progress without empowering its youth to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff9f65] to-[#ff7620]">think, question, and create.</span>
                </h3>

                <p className="text-base sm:text-lg md:text-xl text-blue-50 leading-relaxed max-w-2xl mx-auto font-medium opacity-90">
                  Join us in building a research-driven future where every young mind has the opportunity to innovate.
                </p>

                <div className="pt-3">
                  <Link href="/events">
                    <button className="group relative inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#ff7620] text-white rounded-2xl font-bold text-base sm:text-lg shadow-[0_10px_40px_-10px_rgba(255,118,32,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(255,118,32,0.6)] hover:-translate-y-1 transition-all duration-300 overflow-hidden min-h-[44px]">
                      <span className="relative z-10">Join Our Movement</span>
                      <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-5 py-2 rounded-full bg-[#004aad]/10 text-[#004aad] text-sm font-semibold mb-4">
              Student Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              What Our Learners Say
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from our learners who have transformed their careers through ORIYET
            </p>
          </div>

          {/* Infinite Scrolling Testimonials */}
          <Marquee speed={30} pauseOnHover gradient={false} direction="left" autoFill>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group mx-3 w-[80vw] sm:w-[350px] md:w-[380px] flex-shrink-0 bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-500"
              >
                {/* Subtle Background on Hover */}
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-blue-300 transition-colors duration-300 flex-shrink-0">
                      <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300 truncate">{testimonial.name}</h3>
                      <p className="text-orange-600 text-xs font-semibold truncate">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(testimonial.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-700">{testimonial.rating}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">{testimonial.content}</p>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* 7. Stats Section - Builds Trust */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-[#004aad]/10 text-[#004aad] text-sm font-semibold mb-4">
              Our Impact
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              ORIYET by the Numbers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of learners who are transforming their careers through our platform
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colors = [
                { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', border: 'border-blue-100', hoverBorder: 'group-hover:border-blue-300' },
                { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', border: 'border-purple-100', hoverBorder: 'group-hover:border-purple-300' },
                { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', border: 'border-orange-100', hoverBorder: 'group-hover:border-orange-300' },
                { bg: 'from-pink-500 to-pink-600', light: 'bg-pink-50', border: 'border-pink-100', hoverBorder: 'group-hover:border-pink-300' }
              ];
              const color = colors[index % colors.length];

              return (
                <div key={index} className={`group text-center bg-white rounded-2xl p-4 sm:p-6 border-2 ${color.border} ${color.hoverBorder} hover:-translate-y-2 hover:scale-105 transition-all duration-500 shadow-md hover:shadow-2xl relative overflow-hidden`}>
                  {/* Subtle Background on Hover */}
                  <div className={`absolute inset-0 ${color.light} opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-2xl`}></div>

                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${color.bg} mb-3 sm:mb-4 shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors duration-300">{stat.value}</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Goals Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Our Goals</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Strategic objectives to transform the research and education landscape in Bangladesh
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Knowledge-Driven Community",
                desc: "Foster an active network of students, researchers, and professionals.",
                icon: Users,
                color: "from-blue-500 to-blue-600",
                lightBg: "bg-blue-50",
                borderColor: "border-blue-100",
                hoverBorder: "group-hover:border-blue-300"
              },
              {
                title: "Train Next Generation",
                desc: "Provide workshops and mentoring to develop strong analytical skills.",
                icon: GraduationCap,
                color: "from-purple-500 to-purple-600",
                lightBg: "bg-purple-50",
                borderColor: "border-purple-100",
                hoverBorder: "group-hover:border-purple-300"
              },
              {
                title: "Global Collaboration",
                desc: "Form partnerships with universities and research institutions worldwide.",
                icon: Target,
                color: "from-blue-500 to-blue-600",
                lightBg: "bg-blue-50",
                borderColor: "border-blue-100",
                hoverBorder: "group-hover:border-blue-300"
              },
              {
                title: "Career Advancement",
                desc: "Guide students through admissions, scholarships, and academic planning.",
                icon: BookOpen,
                color: "from-orange-500 to-orange-600",
                lightBg: "bg-orange-50",
                borderColor: "border-orange-100",
                hoverBorder: "group-hover:border-orange-300"
              },
              {
                title: "Quality Education Access",
                desc: "Ensure learning opportunities for all socio-economic backgrounds.",
                icon: Award,
                color: "from-purple-500 to-purple-600",
                lightBg: "bg-purple-50",
                borderColor: "border-purple-100",
                hoverBorder: "group-hover:border-purple-300"
              },
              {
                title: "Sustainable Infrastructure",
                desc: "Establish programs that can grow and continue for years.",
                icon: TrendingUp,
                color: "from-blue-500 to-blue-600",
                lightBg: "bg-blue-50",
                borderColor: "border-blue-100",
                hoverBorder: "group-hover:border-blue-300"
              },
              {
                title: "Leadership & Ethics",
                desc: "Empower youth with values and confidence to lead and innovate.",
                icon: Sparkles,
                color: "from-orange-500 to-orange-600",
                lightBg: "bg-orange-50",
                borderColor: "border-orange-100",
                hoverBorder: "group-hover:border-orange-300"
              },
              {
                title: "Specialized Wings",
                desc: "Create dedicated divisions for research, scholarships, and mentoring.",
                icon: Target,
                color: "from-purple-500 to-purple-600",
                lightBg: "bg-purple-50",
                borderColor: "border-purple-100",
                hoverBorder: "group-hover:border-purple-300"
              }
            ].map((goal, index) => {
              const GoalIcon = goal.icon;
              return (
                <div key={index} className={`group bg-white rounded-2xl p-6 border-2 ${goal.borderColor} ${goal.hoverBorder} hover:-translate-y-2 hover:scale-105 transition-all duration-500 shadow-md hover:shadow-2xl relative overflow-hidden`}>
                  {/* Subtle Background on Hover */}
                  <div className={`absolute inset-0 ${goal.lightBg} opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-2xl`}></div>

                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
                      <GoalIcon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-gray-800 transition-colors duration-300">{goal.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{goal.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. Resources (Blog) Section */}
      {blogs.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-12">
              <span className="inline-block px-5 py-2 rounded-full bg-[#004aad]/10 text-[#004aad] text-sm font-semibold mb-4">
                Resources
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Latest from Our Blog</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Insights, tips, and stories from the learning community
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog: any) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <article className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full border border-gray-100">
                    {blog.featured_image && (
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        <Image
                          src={blog.featured_image}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#004aad] transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{blog.author?.name || 'ORIYET Team'}</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          5 min
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link href="/blog">
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#004aad] text-white rounded-xl font-bold hover:bg-[#003388] transition-all duration-300 shadow-lg hover:shadow-xl min-h-[44px]">
                  View All Articles
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-gray-900">
            Ready to Start Learning?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join ORIYET today and unlock access to hundreds of educational events and expert-led workshops.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#ff7620] text-white rounded-2xl font-bold text-lg shadow-[0_10px_40px_-10px_rgba(255,118,32,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(255,118,32,0.7)] hover:-translate-y-1 transition-all duration-300 overflow-hidden min-h-[44px]">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>

                {/* Button Content */}
                <span className="relative z-10">Create Free Account</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </Link>
            <Link href="/events" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg text-[#004aad] bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 min-h-[44px]">
                Browse Events
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
