import Link from 'next/link';
import { CTAProps } from '@/types/landing';

export default function CTA({ headline, subheadline, primaryCTA }: CTAProps) {
  return (
    <section id="contact" className="relative py-20 md:py-32 bg-gradient-to-r from-primary to-secondary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{headline}</h2>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-12">{subheadline}</p>
          <Link 
            href={primaryCTA.href} 
            className="inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-primary bg-white rounded-lg hover:bg-gray-50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            {primaryCTA.text}
          </Link>
        </div>
      </div>
    </section>
  );
}
