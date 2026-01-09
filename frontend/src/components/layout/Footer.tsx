import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube, ExternalLink } from 'lucide-react';

const footerLinks = {
  platform: [
    { name: 'About Us', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ],
  events: [
    { name: 'Upcoming Events', href: '/events' },
    { name: 'Past Events', href: '/events/past' },
    { name: 'Categories', href: '/events/categories' },
    { name: 'Host an Event', href: '/host-event' },
  ],
  resources: [
    { name: 'Blog', href: '/blog' },
    { name: 'Help Center', href: '/help' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Verify Certificate', href: '/verify-certificate' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Refund Policy', href: '/refund' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/oriyet.org', icon: Facebook },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/oriyet/', icon: Linkedin },
  { name: 'YouTube', href: '#', icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="bg-[#003882] text-white overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-[#ff7620] opacity-5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-[#004aad] opacity-20 rounded-full blur-3xl" />

      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="inline-block">
              <div className="w-32 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 overflow-hidden p-2">
                <Image
                  src="/images/oriyetlogo.png"
                  alt="ORIYET Logo"
                  width={120}
                  height={40}
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-white/70 leading-relaxed text-sm pr-4">
              Your gateway to knowledge and growth. Join educational events, earn certificates,
              and connect with industry experts.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <a href="mailto:team.oriyet@gmail.com" className="flex items-center text-sm text-white/80 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 group-hover:bg-[#ff7620] group-hover:scale-110 transition-all duration-300">
                  <Mail className="w-4 h-4" />
                </div>
                team.oriyet@gmail.com
              </a>
              <a href="tel:+8801700000000" className="flex items-center text-sm text-white/80 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 group-hover:bg-[#ff7620] group-hover:scale-110 transition-all duration-300">
                  <Phone className="w-4 h-4" />
                </div>
                +880 1700-000000
              </a>
              <div className="flex items-center text-sm text-white/80 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 group-hover:bg-[#ff7620] group-hover:scale-110 transition-all duration-300">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <h3 className="font-bold text-lg mb-6 text-white border-b-2 border-[#ff7620] inline-block pb-1">Platform</h3>
            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-[#ff7620] transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="font-bold text-lg mb-6 text-white border-b-2 border-[#ff7620] inline-block pb-1">Events</h3>
            <ul className="space-y-4">
              {footerLinks.events.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-[#ff7620] transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="font-bold text-lg mb-6 text-white border-b-2 border-[#ff7620] inline-block pb-1">Resources</h3>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-[#ff7620] transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="font-bold text-lg mb-6 text-white border-b-2 border-[#ff7620] inline-block pb-1">Legal</h3>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-[#ff7620] transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-white/60 text-center md:text-left">
              <p>
                © {new Date().getFullYear()} ORIYET. All rights reserved.
              </p>
              <span className="hidden md:inline">|</span>
              <a
                href="https://bornosoftnr.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-white/60 hover:text-[#ff7620] transition-colors duration-300"
              >
                Built by <span className="font-semibold">BornoSoftNR</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </a>
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    title={social.name}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#ff7620] text-white flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 hover:shadow-lg hover:shadow-[#ff7620]/50"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
