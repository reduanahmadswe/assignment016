'use client';

import { useState } from 'react';
import { Heart, Users, BookOpen, Award, Lightbulb, Target, CheckCircle, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function DonatePage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const impactAreas = [
    {
      icon: BookOpen,
      title: 'Quality Education',
      description: 'Organize workshops, seminars, and training sessions to upskill Bangladeshi youth',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Create networking opportunities and mentorship programs for students and professionals',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Award,
      title: 'Recognition & Certificates',
      description: 'Provide verified certificates to participants, boosting their career prospects',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Lightbulb,
      title: 'Innovation & Research',
      description: 'Support innovative projects and research initiatives by young minds',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const donationTiers = [
    {
      amount: '৳500',
      title: 'Supporter',
      benefits: ['Certificate of Appreciation', 'Name on Website', 'Quarterly Updates'],
    },
    {
      amount: '৳1,000',
      title: 'Contributor',
      benefits: ['All Supporter Benefits', 'Special Mention in Events', 'Exclusive Content Access'],
      featured: true,
    },
    {
      amount: '৳5,000+',
      title: 'Champion',
      benefits: ['All Contributor Benefits', 'VIP Event Access', 'Direct Impact Report', 'Personal Thank You'],
    },
  ];

  const bankingDetails = {
    accountName: 'ORIYET Educational Foundation',
    bankName: 'Dutch-Bangla Bank Limited',
    accountNumber: '1234567890123',
    branchName: 'Mirpur Branch, Dhaka',
    routingNumber: '090260123',
    swiftCode: 'DBBLBDDH',
  };

  const mobilePayments = [
    { name: 'bKash', number: '01712-345678', type: 'Personal' },
    { name: 'Nagad', number: '01812-345678', type: 'Personal' },
    { name: 'Rocket', number: '01912-3456781', type: 'Personal' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#004aad]/5 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/10 via-[#004aad]/5 to-gray-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#004aad]/10 text-[#004aad] rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Make a Difference Today
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Empower the Next Generation of
              <span className="bg-gradient-to-r from-[#004aad] to-[#0066cc] bg-clip-text text-transparent"> Bangladesh</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your contribution helps us provide free educational events, workshops, and opportunities 
              to thousands of students and young professionals across Bangladesh. Together, we're building 
              a brighter future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#donate-now" className="px-8 py-4 bg-[#004aad] text-white rounded-xl font-semibold hover:bg-[#003580] hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Donate Now
              </a>
              <a href="#our-story" className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-[#004aad] hover:text-[#004aad] transition-all duration-300">
                Our Story
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '5,000+', label: 'Students Reached' },
              { value: '150+', label: 'Events Organized' },
              { value: '3,500+', label: 'Certificates Issued' },
              { value: '50+', label: 'Partner Organizations' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#004aad] to-[#0066cc] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="our-story" className="py-20 bg-gradient-to-br from-[#004aad]/5 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Story & Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Building bridges between education and opportunity
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">Why We Exist</h3>
              <p className="text-gray-600 leading-relaxed">
                ORIYET was founded with a simple yet powerful vision: to democratize access to quality 
                education and professional development opportunities for every young Bangladeshi, regardless 
                of their economic background.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We noticed a critical gap in our education system – while talented students exist everywhere, 
                many lack access to workshops, seminars, networking events, and skill development programs 
                that could transform their careers. Traditional educational institutions often can't provide 
                these practical, industry-focused learning experiences.
              </p>
              <p className="text-gray-600 leading-relaxed">
                That's where ORIYET comes in. We organize free and affordable events, bringing together 
                industry experts, successful professionals, and eager learners. Every workshop we conduct, 
                every speaker we invite, and every certificate we issue is a step toward bridging this gap.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#004aad]/10 rounded-lg">
                    <Target className="w-6 h-6 text-[#004aad]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Our Vision</h4>
                    <p className="text-gray-600 text-sm">
                      A Bangladesh where every young person has access to world-class learning opportunities
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#004aad]/10 rounded-lg">
                    <Heart className="w-6 h-6 text-[#004aad]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Our Mission</h4>
                    <p className="text-gray-600 text-sm">
                      Organize 100+ free educational events annually, reaching 10,000+ students by 2027
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Our Commitment</h4>
                    <p className="text-gray-600 text-sm">
                      100% transparency in fund usage with quarterly impact reports to all donors
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Areas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Your Donation Creates Impact</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every taka you donate directly supports these key areas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-14 h-14 ${area.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{area.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{area.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fund Usage Breakdown */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Where Your Money Goes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete transparency in every taka spent
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                { category: 'Event Organization & Venues', percentage: 40, color: 'bg-[#004aad]' },
                { category: 'Speaker Honorariums & Travel', percentage: 25, color: 'bg-[#0066cc]' },
                { category: 'Marketing & Student Outreach', percentage: 15, color: 'bg-[#0088ff]' },
                { category: 'Certificates & Materials', percentage: 10, color: 'bg-[#33aaff]' },
                { category: 'Platform & Technology', percentage: 7, color: 'bg-[#66bbff]' },
                { category: 'Administrative Costs', percentage: 3, color: 'bg-gray-400' },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{item.category}</span>
                    <span className="font-bold text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-1000`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What ৳5,000 Can Do</h3>
              <div className="space-y-4">
                {[
                  'Host a full-day workshop for 100 students',
                  'Provide certificates to 200 participants',
                  'Bring 2 industry experts as guest speakers',
                  'Organize networking session with refreshments',
                  'Create promotional materials reaching 5,000+ students',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Tiers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Impact Level</h2>
            <p className="text-xl text-gray-600">Every contribution makes a difference</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {donationTiers.map((tier, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                  tier.featured
                    ? 'border-[#004aad] bg-gradient-to-br from-[#004aad]/5 to-gray-50 shadow-xl'
                    : 'border-gray-200 bg-white hover:border-[#004aad]/30'
                }`}
              >
                {tier.featured && (
                  <div className="inline-block px-3 py-1 bg-[#004aad] text-white text-sm font-semibold rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <div className="text-4xl font-bold text-gray-900 mb-2">{tier.amount}</div>
                <div className="text-xl font-semibold text-gray-700 mb-6">{tier.title}</div>
                <ul className="space-y-3 mb-8">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#donate-now"
                  className={`block w-full py-3 rounded-lg font-semibold text-center transition-all ${
                    tier.featured
                      ? 'bg-[#004aad] text-white hover:bg-[#003580]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Donate {tier.amount}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Methods */}
      <section id="donate-now" className="py-20 bg-gradient-to-br from-[#004aad]/5 to-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Banking Information</h2>
            <p className="text-xl text-gray-600">Choose your preferred donation method</p>
          </div>

          {/* Bank Transfer */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#004aad]/10 rounded-lg">
                <svg className="w-6 h-6 text-[#004aad]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Bank Transfer</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(bankingDetails).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-900">{value}</span>
                    <button
                      onClick={() => handleCopy(value, key)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedField === key ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Banking */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#004aad]/10 rounded-lg">
                <svg className="w-6 h-6 text-[#004aad]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Mobile Banking</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {mobilePayments.map((payment, index) => (
                <div key={index} className="space-y-3">
                  <div className="font-bold text-lg text-gray-900">{payment.name}</div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-900">{payment.number}</span>
                    <button
                      onClick={() => handleCopy(payment.number, payment.name)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedField === payment.name ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">{payment.type} Account</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-[#004aad]/5 border border-[#004aad]/20 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-[#004aad] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-bold text-[#004aad] mb-2">After Donating</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Please send us a screenshot of your payment confirmation to{' '}
                  <a href="mailto:donate@oriyet.com" className="font-semibold underline">
                    donate@oriyet.com
                  </a>{' '}
                  with your name and email address. We'll send you a tax-deductible receipt and certificate of appreciation within 3 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#004aad] to-[#0066cc] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of supporters who are investing in Bangladesh's future. Every donation, 
            big or small, creates opportunities for deserving students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#donate-now"
              className="px-8 py-4 bg-white text-[#004aad] rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Donate Now
            </a>
            <a
              href="/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-[#004aad] transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
