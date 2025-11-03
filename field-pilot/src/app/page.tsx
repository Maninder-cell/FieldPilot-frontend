import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

// Feature data with icons
const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    title: 'Equipment Tracking',
    description: 'Track all your field equipment in real-time with GPS location, maintenance schedules, and usage history.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: 'Work Order Management',
    description: 'Create, assign, and track work orders efficiently. Keep your team organized and productive.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Cost Tracking',
    description: 'Monitor expenses, track budgets, and generate detailed financial reports for better decision making.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: 'Mobile Access',
    description: 'Access your data anywhere with our mobile app. Work offline and sync when connected.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Analytics & Reports',
    description: 'Get insights with powerful analytics and customizable reports to optimize your operations.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
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
    content: 'Field Pilot has transformed how we manage our equipment. The real-time tracking and maintenance alerts have saved us thousands in repair costs.',
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
    content: 'We\'ve seen a 40% increase in productivity since implementing Field Pilot. The analytics help us make data-driven decisions every day.',
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
      </svg>
    ),
  },
  {
    platform: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    platform: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero
          headline="Streamline Your Field Operations"
          subheadline="Powerful equipment tracking and work order management for modern field service teams. Increase productivity, reduce costs, and deliver exceptional service."
          primaryCTA={{ text: 'Start Free Trial', href: '/auth/register' }}
          secondaryCTA={{ text: 'Watch Demo', href: '#features' }}
          heroImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
        />
        <Features
          title="Everything You Need to Manage Field Operations"
          subtitle="Comprehensive tools designed to help you track equipment, manage work orders, and optimize your field service operations."
          features={features}
        />
        <Pricing />
        <Testimonials
          title="Trusted by Field Service Teams Worldwide"
          subtitle="See what our customers have to say about Field Pilot and how it's transformed their operations."
          testimonials={testimonials}
        />
        <CTA
          headline="Ready to Transform Your Field Operations?"
          subheadline="Join thousands of teams already using Field Pilot to streamline their operations. Start your free 14-day trial today."
          primaryCTA={{ text: 'Get Started Free', href: '/auth/register' }}
        />
      </main>
      <Footer sections={footerSections} socialLinks={socialLinks} />
    </>
  );
}
