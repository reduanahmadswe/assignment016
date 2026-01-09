'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { Button, Input, Card, CardContent, Alert } from '@/components/ui';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message');
      }

      setSuccess(true);
      reset();
      
      // Auto hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'team.oriyet@gmail.com',
      subContent: 'We reply within 24 hours',
      href: 'mailto:team.oriyet@gmail.com',
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+880 1700-000000',
      subContent: 'Mon-Fri, 9am - 6pm',
      href: 'tel:+8801700000000',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'Dhaka, Bangladesh',
      subContent: 'Get Directions',
      href: '#',
    },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/oriyet.org' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/company/oriyet/' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 sm:w-96 sm:h-96 bg-[#004aad]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-80 sm:h-80 bg-[#ff7620]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="bg-white pt-24 sm:pt-32 pb-12 sm:pb-16 relative z-10 border-b border-gray-100">
        <div className="container-custom text-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-[#004aad]/5 rounded-2xl animate-in fade-in zoom-in duration-500">
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#004aad]" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#004aad] mb-4 sm:mb-6 tracking-tight">
            Get in Touch with Us
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about our events or need support? We're here to help you on your learning journey.
          </p>
        </div>
      </section>

      <section className="container-custom py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* Contact Info Sidebar - Stacks on Mobile */}
          <div className="flex flex-col gap-6 lg:h-full lg:sticky lg:top-24">
            <div className="flex flex-col gap-4">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <a
                    key={info.title}
                    href={info.href}
                    className="group flex items-start gap-4 p-5 bg-white rounded-xl border-2 border-gray-100 hover:border-[#004aad]/30 hover:shadow-xl hover:shadow-[#004aad]/10 transition-all duration-300 transform md:hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#004aad]/10 to-[#004aad]/5 group-hover:from-[#004aad] group-hover:to-[#003882] text-[#004aad] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-all duration-300 md:group-hover:scale-110 md:group-hover:rotate-3 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-[#004aad] transition-colors">{info.title}</h3>
                      <p className="font-semibold text-sm text-[#004aad] group-hover:text-[#003882] transition-colors break-words">{info.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{info.subContent}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Social Links Box */}
            <div className="bg-[#004aad] rounded-xl p-8 text-center text-white relative overflow-hidden flex flex-col justify-center flex-grow shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Follow Our Community</h3>
                <p className="text-white/80 mb-6 text-sm">Stay updated with latest news and events</p>
                <div className="flex justify-center gap-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-[#ff7620] hover:text-white flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 hover:shadow-lg backdrop-blur-sm"
                      >
                        <span className="sr-only">{social.name}</span>
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form - Main Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                <p className="text-gray-500 text-sm sm:text-base">Fill out the form below and we'll reply as soon as possible.</p>
              </div>

              {success && (
                <div className="mb-6 animate-in slide-in-from-top-2">
                  <Alert variant="success" className="bg-green-50 text-green-700 border-green-200" dismissible onDismiss={() => setSuccess(false)}>
                    আপনার মেসেজ সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। ধন্যবাদ!
                  </Alert>
                </div>
              )}

              {error && (
                <div className="mb-6 animate-in slide-in-from-top-2">
                  <Alert variant="error" dismissible onDismiss={() => setError('')}>
                    {error}
                  </Alert>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Your Name</label>
                    <Input
                      placeholder="John Doe"
                      error={errors.name?.message}
                      className="h-12 rounded-xl border-gray-200 focus:border-[#004aad] focus:ring-[#004aad]/20 text-base"
                      {...register('name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      error={errors.email?.message}
                      className="h-12 rounded-xl border-gray-200 focus:border-[#004aad] focus:ring-[#004aad]/20 text-base"
                      {...register('email')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                  <Input
                    placeholder="How can we help you?"
                    error={errors.subject?.message}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#004aad] focus:ring-[#004aad]/20 text-base"
                    {...register('subject')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Message <span className="text-[#ff7620]">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#004aad] focus:ring-4 focus:ring-[#004aad]/10 transition-shadow resize-none bg-gray-50/50 text-base"
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full sm:w-auto min-w-[160px] h-12 text-base font-bold bg-[#ff7620] hover:bg-[#e06516] rounded-xl shadow-lg shadow-[#ff7620]/20 hover:shadow-[#ff7620]/30 transition-all duration-300 hover:-translate-y-0.5"
                  leftIcon={<Send className="w-5 h-5" />}
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
