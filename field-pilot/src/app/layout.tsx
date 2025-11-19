import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { BillingProvider } from "@/contexts/BillingContext";
import { StripeProvider } from "@/components/providers/StripeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FieldRino - Streamline Your Field Operations",
  description: "Powerful equipment tracking and work order management for modern field service teams. Increase productivity, reduce costs, and deliver exceptional service.",
  keywords: ["field service", "equipment tracking", "work order management", "field operations", "maintenance management"],
  authors: [{ name: "FieldRino" }],
  openGraph: {
    title: "FieldRino - Streamline Your Field Operations",
    description: "Powerful equipment tracking and work order management for modern field service teams.",
    type: "website",
    locale: "en_US",
    siteName: "FieldRino",
  },
  twitter: {
    card: "summary_large_image",
    title: "FieldRino - Streamline Your Field Operations",
    description: "Powerful equipment tracking and work order management for modern field service teams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <OnboardingProvider>
            <BillingProvider>
              <StripeProvider>
                {children}
              </StripeProvider>
            </BillingProvider>
          </OnboardingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
