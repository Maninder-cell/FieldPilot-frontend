'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { BillingProvider } from '@/contexts/BillingContext';
import { StripeProvider } from '@/components/providers/StripeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <OnboardingProvider>
                <BillingProvider>
                    <StripeProvider>
                        {children}
                    </StripeProvider>
                </BillingProvider>
            </OnboardingProvider>
        </AuthProvider>
    );
}
