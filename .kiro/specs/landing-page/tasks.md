# Implementation Plan

- [x] 1. Set up CSS variables and design system
  - Create `src/styles/variables.css` with all design tokens (colors, spacing, typography, shadows, transitions)
  - Import variables into `src/app/globals.css`
  - Add base styles and resets to globals.css
  - _Requirements: 1.4, 1.5, 1.6, 1.7_

- [x] 2. Create TypeScript interfaces and types
  - Create `src/types/landing.ts` with all interfaces (SubscriptionPlan, Feature, Testimonial, CTAButton, ApiResponse)
  - _Requirements: 1.2_

- [x] 3. Set up API client utility
  - Create `src/lib/api.ts` with fetch wrapper function
  - Implement error handling and response parsing
  - Add function to fetch subscription plans from `/api/billing/plans/`
  - _Requirements: 1.3_

- [x] 4. Implement Header component
- [x] 4.1 Create Header component structure
  - Create `src/components/landing/Header.tsx` with logo, navigation links, and CTA buttons
  - Implement sticky positioning with scroll detection
  - Add mobile hamburger menu toggle functionality
  - _Requirements: 1.6.1, 1.6.2, 1.6.5_

- [x] 4.2 Create Header styles
  - Create `src/styles/landing/header.module.css` using CSS variables
  - Implement responsive styles for mobile and desktop
  - Add smooth transitions for scroll effects and menu animations
  - _Requirements: 1.5, 1.10.1, 1.10.5_

- [x] 4.3 Implement smooth scroll navigation
  - Add click handlers for navigation links to scroll to sections
  - Implement active section highlighting based on scroll position
  - _Requirements: 1.6.3, 1.6.4_

- [x] 5. Implement Hero section
- [x] 5.1 Create Hero component structure
  - Create `src/components/landing/Hero.tsx` with headline, subheadline, CTAs, and hero image
  - Implement two-column layout for desktop, single-column for mobile
  - Add trust indicators (customer count, rating)
  - _Requirements: 1.1.1, 1.1.2, 1.1.3, 1.1.4_

- [x] 5.2 Create Hero styles
  - Create `src/styles/landing/hero.module.css` with gradient text effect on headline
  - Implement responsive layout styles
  - Add image optimization with Next.js Image component
  - _Requirements: 1.5, 1.9.2, 1.9.5_

- [x] 5.3 Add Hero animations
  - Implement fade-in animations for text and image on page load
  - Add hover effects to CTA buttons
  - _Requirements: 1.9.3, 1.10.1_

- [x] 6. Implement Features section
- [x] 6.1 Create Features component structure
  - Create `src/components/landing/Features.tsx` with section title, subtitle, and feature grid
  - Define static feature data with icons from react-icons
  - Implement responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
  - _Requirements: 1.2.1, 1.2.2, 1.2.3, 1.2.4_

- [x] 6.2 Create Features styles
  - Create `src/styles/landing/features.module.css` with card styles
  - Implement hover effects with lift and shadow
  - Add responsive grid styles
  - _Requirements: 1.5, 1.10.1_

- [x] 6.3 Add Features scroll animations
  - Implement Intersection Observer to animate features as they enter viewport
  - Add stagger effect for feature cards
  - _Requirements: 1.9.3_

- [x] 7. Implement Pricing section
- [x] 7.1 Create Pricing component structure
  - Create `src/components/landing/Pricing.tsx` with billing cycle toggle and plan cards
  - Implement state management for billing cycle (monthly/yearly)
  - Add popular plan badge
  - _Requirements: 1.3.1, 1.3.2, 1.3.3, 1.3.4_

- [x] 7.2 Integrate subscription plans API
  - Fetch plans from `/api/billing/plans/` using the API client
  - Implement loading state with skeleton screens
  - Add error handling with fallback to static data
  - _Requirements: 1.3.1, 1.9.1_

- [x] 7.3 Create Pricing styles
  - Create `src/styles/landing/pricing.module.css` with card styles
  - Implement popular plan highlighting
  - Add responsive grid layout
  - _Requirements: 1.5, 1.3.3_

- [x] 7.4 Add Pricing interactions
  - Implement billing cycle toggle animation
  - Add hover effects to pricing cards
  - Implement smooth price transition when switching billing cycles
  - _Requirements: 1.10.1, 1.10.5_

- [x] 8. Implement Testimonials section
- [x] 8.1 Create Testimonials component structure
  - Create `src/components/landing/Testimonials.tsx` with section title and testimonial grid
  - Define static testimonial data
  - Implement responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
  - _Requirements: 1.7.1, 1.7.2, 1.7.3, 1.7.4_

- [x] 8.2 Create Testimonials styles
  - Create `src/styles/landing/testimonials.module.css` with card styles
  - Implement avatar and rating display
  - Add responsive grid styles
  - _Requirements: 1.5_

- [x] 8.3 Add Testimonials animations
  - Implement scroll animations for testimonial cards
  - Add stagger effect
  - _Requirements: 1.9.3_

- [x] 9. Implement Final CTA section
- [x] 9.1 Create CTA component structure
  - Create `src/components/landing/CTA.tsx` with headline, subheadline, and primary CTA button
  - Implement gradient background
  - _Requirements: 1.8.3_

- [x] 9.2 Create CTA styles
  - Create `src/styles/landing/cta.module.css` with gradient background
  - Style large CTA button with inverse colors
  - _Requirements: 1.5_

- [x] 10. Implement Footer component
- [x] 10.1 Create Footer component structure
  - Create `src/components/landing/Footer.tsx` with link sections, social links, and legal links
  - Define static footer data
  - Implement responsive multi-column layout
  - _Requirements: 1.8.1, 1.8.2, 1.8.5_

- [x] 10.2 Create Footer styles
  - Create `src/styles/landing/footer.module.css` with dark background
  - Implement responsive grid layout
  - _Requirements: 1.5_

- [x] 11. Assemble landing page
- [x] 11.1 Update main page component
  - Update `src/app/page.tsx` to compose all landing page sections
  - Import and arrange components in correct order (Header, Hero, Features, Pricing, Testimonials, CTA, Footer)
  - _Requirements: All_

- [x] 11.2 Add page metadata
  - Add SEO metadata (title, description, Open Graph tags)
  - Add favicon and app icons
  - _Requirements: 1.1_

- [x] 12. Implement responsive behavior
- [x] 12.1 Test and refine mobile layout
  - Test all components on mobile viewport (< 640px)
  - Ensure touch targets are minimum 44px
  - Verify text readability and spacing
  - _Requirements: 1.5.1, 1.5.4, 1.5.5_

- [x] 12.2 Test and refine tablet layout
  - Test all components on tablet viewport (640px - 1023px)
  - Verify grid layouts adapt correctly
  - _Requirements: 1.5.2_

- [x] 12.3 Test and refine desktop layout
  - Test all components on desktop viewport (1024px+)
  - Verify multi-column layouts display correctly
  - _Requirements: 1.5.3_

- [x] 13. Implement accessibility features
- [x] 13.1 Add semantic HTML and ARIA attributes
  - Ensure proper heading hierarchy throughout the page
  - Add ARIA labels to icon-only buttons
  - Add aria-current to active navigation items
  - _Requirements: 1.6.4_

- [x] 13.2 Implement keyboard navigation
  - Test tab order follows visual flow
  - Ensure focus indicators are visible
  - Add skip to main content link
  - _Requirements: 1.10.4_

- [x] 13.3 Verify color contrast
  - Check all text meets WCAG 4.5:1 contrast ratio
  - Verify interactive elements have clear visual distinction
  - _Requirements: 1.4_

- [x] 14. Optimize performance
- [x] 14.1 Optimize images
  - Implement lazy loading for below-the-fold images
  - Add blur placeholders to images
  - Verify Next.js Image optimization is working
  - _Requirements: 1.9.1, 1.9.2, 1.9.5_

- [x] 14.2 Optimize bundle size
  - Verify CSS modules are properly scoped
  - Check for unused CSS
  - Analyze bundle size with Next.js analyzer
  - _Requirements: 1.9.4_

- [x] 14.3 Test loading performance
  - Run Lighthouse audit (target 90+ in all categories)
  - Verify initial page render is under 2 seconds
  - Check Core Web Vitals
  - _Requirements: 1.9.4_

- [x] 15. Final polish and testing
- [x] 15.1 Cross-browser testing
  - Test in Chrome, Firefox, Safari, and Edge
  - Verify all animations and transitions work correctly
  - Check for any layout issues
  - _Requirements: All_

- [x] 15.2 Interactive element feedback
  - Verify all buttons show hover, active, and focus states
  - Check form inputs show focus indicators
  - Ensure cursor styles are appropriate
  - _Requirements: 1.10.1, 1.10.2, 1.10.3, 1.10.4_

- [x] 15.3 Final visual review
  - Review spacing and alignment across all sections
  - Verify color consistency using CSS variables
  - Check typography hierarchy and readability
  - _Requirements: 1.4, 1.7_
