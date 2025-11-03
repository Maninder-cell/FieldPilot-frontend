# Design Document

## Overview

The Field Pilot landing page is a modern, professional single-page application designed to convert visitors into users. The page follows a vertical scroll layout with distinct sections that guide users through the product value proposition, features, pricing, and social proof. The design emphasizes clarity, professionalism, and ease of use across all devices.

### Design Goals

- Create an immediate positive first impression with a clean, modern aesthetic
- Clearly communicate the product's value proposition within 3 seconds
- Guide users naturally through the conversion funnel
- Maintain visual consistency through a centralized design system
- Ensure accessibility and responsive behavior across all devices
- Optimize for performance with fast load times and smooth interactions

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: CSS Modules with CSS Variables
- **Icons**: React Icons library (lucide-react or heroicons)
- **Animations**: CSS transitions and transforms (no heavy animation libraries)
- **Image Optimization**: Next.js Image component
- **Type Safety**: TypeScript

### File Structure

```
field-pilot/src/
├── app/
│   ├── page.tsx                    # Landing page component
│   ├── layout.tsx                  # Root layout (existing)
│   └── globals.css                 # Global styles (existing)
├── components/
│   └── landing/
│       ├── Header.tsx              # Navigation header
│       ├── Hero.tsx                # Hero section
│       ├── Features.tsx            # Features showcase
│       ├── Pricing.tsx             # Pricing plans
│       ├── Testimonials.tsx        # Customer testimonials
│       ├── CTA.tsx                 # Final call-to-action
│       └── Footer.tsx              # Footer section
├── styles/
│   ├── variables.css               # CSS variables (design tokens)
│   └── landing/
│       ├── header.module.css
│       ├── hero.module.css
│       ├── features.module.css
│       ├── pricing.module.css
│       ├── testimonials.module.css
│       ├── cta.module.css
│       └── footer.module.css
├── lib/
│   └── api.ts                      # API client for backend integration
└── types/
    └── landing.ts                  # TypeScript interfaces
```

## Components and Interfaces

### 1. CSS Variables System (Design Tokens)

The design system is built on CSS custom properties organized into logical categories:

#### Color Palette

```css
/* Primary Brand Colors */
--color-primary: #2563eb;           /* Blue - main brand color */
--color-primary-hover: #1d4ed8;     /* Darker blue for hover states */
--color-primary-active: #1e40af;    /* Even darker for active states */
--color-primary-light: #dbeafe;     /* Light blue for backgrounds */

/* Secondary Colors */
--color-secondary: #7c3aed;         /* Purple - accent color */
--color-secondary-hover: #6d28d9;
--color-secondary-light: #ede9fe;

/* Neutral Colors */
--color-neutral-50: #f9fafb;
--color-neutral-100: #f3f4f6;
--color-neutral-200: #e5e7eb;
--color-neutral-300: #d1d5db;
--color-neutral-400: #9ca3af;
--color-neutral-500: #6b7280;
--color-neutral-600: #4b5563;
--color-neutral-700: #374151;
--color-neutral-800: #1f2937;
--color-neutral-900: #111827;

/* Semantic Colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* Text Colors */
--color-text-primary: var(--color-neutral-900);
--color-text-secondary: var(--color-neutral-600);
--color-text-tertiary: var(--color-neutral-500);
--color-text-inverse: #ffffff;

/* Background Colors */
--color-bg-primary: #ffffff;
--color-bg-secondary: var(--color-neutral-50);
--color-bg-tertiary: var(--color-neutral-100);
--color-bg-dark: var(--color-neutral-900);

/* Border Colors */
--color-border-light: var(--color-neutral-200);
--color-border-medium: var(--color-neutral-300);
--color-border-dark: var(--color-neutral-400);

/* Modal & Overlay */
--color-overlay: rgba(0, 0, 0, 0.5);
--color-modal-bg: #ffffff;
--color-modal-shadow: rgba(0, 0, 0, 0.1);
```

#### Button States

```css
/* Primary Button */
--btn-primary-bg: var(--color-primary);
--btn-primary-bg-hover: var(--color-primary-hover);
--btn-primary-bg-active: var(--color-primary-active);
--btn-primary-text: var(--color-text-inverse);
--btn-primary-border: var(--color-primary);
--btn-primary-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
--btn-primary-shadow-hover: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Secondary Button */
--btn-secondary-bg: transparent;
--btn-secondary-bg-hover: var(--color-neutral-50);
--btn-secondary-bg-active: var(--color-neutral-100);
--btn-secondary-text: var(--color-primary);
--btn-secondary-border: var(--color-primary);

/* Disabled Button */
--btn-disabled-bg: var(--color-neutral-200);
--btn-disabled-text: var(--color-neutral-400);
--btn-disabled-border: var(--color-neutral-200);
```

#### Spacing Scale

```css
--spacing-xs: 0.25rem;    /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-2xl: 3rem;      /* 48px */
--spacing-3xl: 4rem;      /* 64px */
--spacing-4xl: 6rem;      /* 96px */
--spacing-5xl: 8rem;      /* 128px */
```

#### Typography

```css
/* Font Families */
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-heading: var(--font-primary);

/* Font Sizes */
--text-xs: 0.75rem;       /* 12px */
--text-sm: 0.875rem;      /* 14px */
--text-base: 1rem;        /* 16px */
--text-lg: 1.125rem;      /* 18px */
--text-xl: 1.25rem;       /* 20px */
--text-2xl: 1.5rem;       /* 24px */
--text-3xl: 1.875rem;     /* 30px */
--text-4xl: 2.25rem;      /* 36px */
--text-5xl: 3rem;         /* 48px */
--text-6xl: 3.75rem;      /* 60px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

#### Borders & Shadows

```css
/* Border Radius */
--radius-sm: 0.25rem;     /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.15);
```

#### Transitions

```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

#### Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### 2. Header Component

**Purpose**: Sticky navigation header with logo, navigation links, and CTA buttons.

**Props Interface**:
```typescript
interface HeaderProps {
  // No props needed - uses internal state
}
```

**Features**:
- Sticky positioning with backdrop blur on scroll
- Mobile hamburger menu for responsive design
- Smooth scroll to sections
- Active section highlighting
- Login and Sign Up CTAs

**Visual Design**:
- Height: 72px (desktop), 64px (mobile)
- Background: White with 80% opacity and backdrop blur when scrolled
- Border bottom: 1px solid neutral-200
- Logo: Left-aligned, 40px height
- Navigation: Center-aligned (desktop), hidden in mobile menu
- CTAs: Right-aligned, Login (secondary) + Sign Up (primary)

### 3. Hero Section

**Purpose**: Capture attention and communicate value proposition immediately.

**Props Interface**:
```typescript
interface HeroProps {
  headline: string;
  subheadline: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA: {
    text: string;
    href: string;
  };
  heroImage: string;
}
```

**Features**:
- Large, bold headline with gradient text effect
- Supporting subheadline
- Two prominent CTAs (primary and secondary)
- Hero illustration/image on the right
- Trust indicators (customer count, rating)

**Visual Design**:
- Layout: Two-column (desktop), single-column (mobile)
- Headline: text-5xl (desktop), text-4xl (mobile), font-bold
- Gradient: Primary to secondary color on headline
- Spacing: 4xl vertical padding
- Image: 50% width (desktop), full width (mobile)

### 4. Features Section

**Purpose**: Showcase key product features with icons and descriptions.

**Props Interface**:
```typescript
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesProps {
  title: string;
  subtitle: string;
  features: Feature[];
}
```

**Features**:
- Grid layout: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Icon, title, and description for each feature
- Hover effects on feature cards
- Section title and subtitle

**Visual Design**:
- Grid gap: spacing-xl
- Card: White background, border, rounded corners, padding-xl
- Icon: 48px, primary color, circular background
- Title: text-xl, font-semibold
- Description: text-base, text-secondary
- Hover: Lift effect with shadow-lg

### 5. Pricing Section

**Purpose**: Display subscription plans with clear pricing and features.

**Props Interface**:
```typescript
interface PricingPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_monthly: string;
  price_yearly: string;
  features: string[];
  isPopular?: boolean;
}

interface PricingProps {
  title: string;
  subtitle: string;
  plans: PricingPlan[];
  billingCycle: 'monthly' | 'yearly';
  onBillingCycleChange: (cycle: 'monthly' | 'yearly') => void;
}
```

**Features**:
- Billing cycle toggle (monthly/yearly)
- Three pricing tiers in a grid
- Popular plan highlighted
- Feature list with checkmarks
- CTA button for each plan
- Fetches plans from `/api/billing/plans/`

**Visual Design**:
- Grid: 3 columns (desktop), 1 column (mobile)
- Card: White background, border, rounded-xl, padding-2xl
- Popular badge: Primary color, absolute positioned
- Price: text-5xl, font-bold
- Features: List with checkmark icons
- CTA: Full-width button at bottom

### 6. Testimonials Section

**Purpose**: Build trust through customer testimonials and social proof.

**Props Interface**:
```typescript
interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

interface TestimonialsProps {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}
```

**Features**:
- Grid of testimonial cards
- Customer avatar, name, role, company
- Star rating display
- Testimonial text
- Trust indicators (total customers, average rating)

**Visual Design**:
- Grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Card: Light background, rounded-lg, padding-xl
- Avatar: 64px circular image
- Rating: Star icons in primary color
- Content: Italic text, text-secondary

### 7. Final CTA Section

**Purpose**: Last conversion opportunity before footer.

**Props Interface**:
```typescript
interface CTAProps {
  headline: string;
  subheadline: string;
  primaryCTA: {
    text: string;
    href: string;
  };
}
```

**Features**:
- Bold headline
- Supporting text
- Large primary CTA button
- Contrasting background (gradient or solid color)

**Visual Design**:
- Background: Gradient from primary to secondary
- Text: White/inverse color
- Centered content
- Padding: 5xl vertical
- Button: Large size, white background, primary text

### 8. Footer Component

**Purpose**: Provide navigation, legal links, and contact information.

**Props Interface**:
```typescript
interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  sections: FooterSection[];
  socialLinks: {
    platform: string;
    href: string;
    icon: React.ReactNode;
  }[];
}
```

**Features**:
- Multi-column layout with link sections
- Social media icons
- Copyright notice
- Legal links (Privacy, Terms)
- Company contact information

**Visual Design**:
- Background: Dark (neutral-900)
- Text: Light colors (neutral-300)
- Grid: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Padding: 3xl vertical
- Border top: 1px solid neutral-800

## Data Models

### TypeScript Interfaces

```typescript
// types/landing.ts

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
```

## Error Handling

### API Integration

- Fetch subscription plans from `/api/billing/plans/` on component mount
- Display loading state while fetching
- Show error message if API call fails
- Fallback to static pricing data if API is unavailable

### Error States

```typescript
interface ErrorState {
  hasError: boolean;
  message: string;
  retry?: () => void;
}
```

### User Feedback

- Loading spinners for async operations
- Error messages with retry options
- Success confirmations for form submissions
- Toast notifications for non-blocking feedback

## Testing Strategy

### Component Testing

- Unit tests for each component using React Testing Library
- Test responsive behavior at different breakpoints
- Test interactive elements (buttons, links, forms)
- Test accessibility (ARIA labels, keyboard navigation)

### Integration Testing

- Test API integration with mock data
- Test navigation between sections
- Test form submissions
- Test error handling scenarios

### Visual Regression Testing

- Snapshot tests for component rendering
- Test different viewport sizes
- Test hover and active states
- Test dark mode (if implemented)

### Performance Testing

- Lighthouse scores (aim for 90+ in all categories)
- Core Web Vitals monitoring
- Image optimization verification
- Bundle size analysis

### Accessibility Testing

- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast ratios (minimum 4.5:1 for text)

## Responsive Design Strategy

### Breakpoint Strategy

- **Mobile First**: Base styles for mobile (< 640px)
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px - 1279px
- **Large Desktop**: 1280px+

### Layout Adaptations

**Header**:
- Mobile: Hamburger menu, stacked logo and menu
- Desktop: Horizontal navigation, inline CTAs

**Hero**:
- Mobile: Single column, image below text
- Desktop: Two columns, image on right

**Features**:
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 3 columns

**Pricing**:
- Mobile: Single column, stacked cards
- Tablet: 2 columns (popular plan full width)
- Desktop: 3 columns

**Testimonials**:
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 3 columns

**Footer**:
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 4 columns

### Touch Targets

- Minimum size: 44px × 44px
- Adequate spacing between interactive elements
- Larger buttons on mobile devices

## Performance Optimization

### Image Optimization

- Use Next.js Image component for automatic optimization
- Lazy load images below the fold
- Provide appropriate sizes for different viewports
- Use WebP format with fallbacks
- Implement blur placeholders

### Code Splitting

- Lazy load non-critical components
- Split CSS by component
- Dynamic imports for heavy dependencies

### Caching Strategy

- Cache API responses (subscription plans)
- Use SWR or React Query for data fetching
- Implement stale-while-revalidate pattern

### Bundle Optimization

- Tree shaking for unused code
- Minimize third-party dependencies
- Use lightweight icon libraries
- Compress and minify assets

## Animation & Interactions

### Scroll Animations

- Fade in elements as they enter viewport
- Use Intersection Observer API
- Stagger animations for lists
- Smooth scroll behavior for navigation

### Hover Effects

- Button: Scale (1.02), shadow increase
- Card: Lift effect, shadow increase
- Link: Color change, underline
- Icon: Rotate or scale

### Transition Timing

- Fast: 150ms (small UI changes)
- Base: 200ms (standard interactions)
- Slow: 300ms (complex animations)

### Loading States

- Skeleton screens for content loading
- Spinner for button actions
- Progress indicators for multi-step processes

## Accessibility Considerations

### Semantic HTML

- Use proper heading hierarchy (h1 → h6)
- Use semantic elements (nav, main, section, article, footer)
- Use button elements for clickable actions
- Use anchor tags for navigation

### ARIA Attributes

- aria-label for icon-only buttons
- aria-expanded for collapsible sections
- aria-current for active navigation items
- aria-live for dynamic content updates

### Keyboard Navigation

- Tab order follows visual flow
- Focus indicators visible and clear
- Skip to main content link
- Escape key closes modals/menus

### Color Contrast

- Text: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Clear visual distinction
- Don't rely solely on color for information

## Integration Points

### Backend API

**Subscription Plans**:
- Endpoint: `GET /api/billing/plans/`
- Used in: Pricing component
- Caching: 1 hour
- Fallback: Static data

**Authentication**:
- Sign Up: Redirect to `/auth/register`
- Login: Redirect to `/auth/login`
- These pages will be created in future specs

### Analytics

- Track page views
- Track CTA clicks
- Track section visibility
- Track pricing plan selections

### Third-Party Services

- Email capture for newsletter (future)
- Live chat widget (future)
- Analytics (Google Analytics, Mixpanel)

## Design Decisions & Rationale

### CSS Variables Over Tailwind

- Centralized theme management
- Easier to maintain consistency
- Better for dynamic theming
- Smaller bundle size for this use case

### Component-Based Architecture

- Reusable components
- Easier testing
- Better maintainability
- Clear separation of concerns

### Static Content with API Integration

- Fast initial load
- Progressive enhancement
- Graceful degradation
- SEO-friendly

### Mobile-First Approach

- Majority of traffic is mobile
- Easier to scale up than down
- Forces focus on essential content
- Better performance on mobile devices

### Minimal Dependencies

- Faster load times
- Smaller bundle size
- Fewer security vulnerabilities
- Easier maintenance

## Future Enhancements

- Dark mode support
- Internationalization (i18n)
- A/B testing framework
- Advanced animations with Framer Motion
- Video backgrounds in hero section
- Interactive product demos
- Live chat integration
- Blog section integration
