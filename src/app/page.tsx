'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import TrustedBy from '@/components/landing/TrustedBy';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import {
  Box,
  CalendarCheck,
  DollarSign,
  Smartphone,
  BarChart3,
  Users,
} from 'lucide-react';

const getDashboardRoute = (role?: string | null) => {
  const r = role?.toLowerCase();
  if (r === 'technician') return '/technician/dashboard';
  if (r === 'customer' || !r) return '/customer/dashboard';
  if (r === 'owner' || r === 'admin' || r === 'manager' || r === 'employee') return '/organization/dashboard';
  return '/customer/dashboard';
};

// Feature data with Lucide icons
const features = [
  {
    icon: <Box className="w-7 h-7" />,
    title: 'Equipment Tracking',
    description: 'Track all your field equipment in real-time with GPS location, maintenance schedules, and usage history.',
  },
  {
    icon: <CalendarCheck className="w-7 h-7" />,
    title: 'Work Order Management',
    description: 'Create, assign, and track work orders efficiently. Keep your team organized and productive.',
  },
  {
    icon: <DollarSign className="w-7 h-7" />,
    title: 'Cost Tracking',
    description: 'Monitor expenses, track budgets, and generate detailed financial reports for better decision making.',
  },
  {
    icon: <Smartphone className="w-7 h-7" />,
    title: 'Mobile Access',
    description: 'Access your data anywhere with our mobile app. Work offline and sync when connected.',
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: 'Analytics & Reports',
    description: 'Get insights with powerful analytics and customizable reports to optimize your operations.',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: 'Team Collaboration',
    description: 'Collaborate seamlessly with your team. Share updates, assign tasks, and communicate in real-time.',
  },
];

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Operations Manager',
    company: 'BuildCo',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: 'FieldRino has transformed how we manage our equipment. The real-time tracking and maintenance alerts have saved us thousands in repair costs.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Field Supervisor',
    company: 'TechServices Inc',
    avatar: 'https://i.pravatar.cc/150?img=13',
    content: 'The mobile app is a game-changer. Our technicians can update work orders on-site, and I can track everything from my office. Highly recommended!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'CEO',
    company: 'GreenScape Solutions',
    avatar: 'https://i.pravatar.cc/150?img=5',
    content: 'We\'ve seen a 40% increase in productivity since implementing FieldRino. The analytics help us make data-driven decisions every day.',
    rating: 5,
  },
];

// Footer data
const footerSections = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Security', href: '/security' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Support', href: '/support' },
      { label: 'Status', href: '/status' },
    ],
  },
];

const socialLinks = [
  {
    platform: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
      </svg>
    ),
  },
  {
    platform: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    platform: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
      </svg>
    ),
  },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(getDashboardRoute(user.role));
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Don't render landing page if user is authenticated (redirect is in progress)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>
        <Hero
          headline="Streamline Your Field Operations"
          subheadline="Powerful equipment tracking and work order management for modern field service teams. Increase productivity, reduce costs, and deliver exceptional service."
          primaryCTA={{ text: 'Start Free Trial', href: '/register' }}
          secondaryCTA={{ text: 'Watch Demo', href: '#features' }}
          heroImage=""
        />
        <TrustedBy />
        <Features
          title="Everything You Need to Manage Field Operations"
          subtitle="Comprehensive tools designed to help you track equipment, manage work orders, and optimize your field service operations."
          features={features}
        />
        <HowItWorks />
        <Pricing />
        <Testimonials
          title="Trusted by Field Service Teams Worldwide"
          subtitle="See what our customers have to say about FieldRino and how it's transformed their operations."
          testimonials={testimonials}
        />
        <CTA
          headline="Ready to Transform Your Field Operations?"
          subheadline="Join thousands of teams already using FieldRino to streamline their operations. Start your free 14-day trial today."
          primaryCTA={{ text: 'Get Started Free', href: '/register' }}
        />
      </main>
      <Footer sections={footerSections} socialLinks={socialLinks} />
    </>
  );
}
