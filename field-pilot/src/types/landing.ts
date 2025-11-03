// TypeScript interfaces for Field Pilot Landing Page

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_monthly: string;
  price_yearly: string;
  yearly_discount_percentage: number;
  max_users: number | null;
  max_equipment: number | null;
  max_storage_gb: number;
  max_api_calls_per_month: number | null;
  features: string[];
  is_active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

export interface CTAButton {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

export interface HeroProps {
  headline: string;
  subheadline: string;
  primaryCTA: CTAButton;
  secondaryCTA: CTAButton;
  heroImage: string;
}

export interface FeaturesProps {
  title: string;
  subtitle: string;
  features: Feature[];
}

export interface PricingProps {
  title: string;
  subtitle: string;
  plans: SubscriptionPlan[];
  billingCycle: 'monthly' | 'yearly';
  onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void;
}

export interface TestimonialsProps {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

export interface CTAProps {
  headline: string;
  subheadline: string;
  primaryCTA: CTAButton;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  platform: string;
  href: string;
  icon: React.ReactNode;
}

export interface FooterProps {
  sections: FooterSection[];
  socialLinks: SocialLink[];
}
