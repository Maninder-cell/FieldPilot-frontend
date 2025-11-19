'use client';

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBilling } from '@/contexts/BillingContext';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentMethodFormProps {
  onSuccess?: (paymentMethodId?: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: false,
};

export function PaymentMethodForm({
  onSuccess,
  onError,
  onCancel,
  showCancel = false,
}: PaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { setupPaymentMethod } = useBilling();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [billingName, setBillingName] = useState(user?.full_name || '');
  const [billingEmail, setBillingEmail] = useState(user?.email || '');

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!billingName.trim()) {
      setCardError('Please enter cardholder name');
      return;
    }

    if (!billingEmail.trim()) {
      setCardError('Please enter billing email');
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      // Step 1: Get setup intent from backend
      const { client_secret } = await setupPaymentMethod();

      // Step 2: Confirm card setup with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { setupIntent, error } = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingName,
            email: billingEmail,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!setupIntent || !setupIntent.payment_method) {
        throw new Error('Failed to setup payment method');
      }

      // Step 3: Pass payment method ID to parent for subscription creation
      // The backend will automatically save and charge this payment method
      // when the subscription is created via /api/v1/billing/subscription/create/
      const paymentMethodId = setupIntent.payment_method as string;
      console.log('Payment method created:', paymentMethodId);

      // Success - pass payment method ID to parent
      if (onSuccess) {
        onSuccess(paymentMethodId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment method';
      setCardError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Billing Name */}
      <div>
        <label htmlFor="billing-name" className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name
        </label>
        <input
          id="billing-name"
          type="text"
          value={billingName}
          onChange={(e) => setBillingName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={isProcessing}
          required
        />
      </div>

      {/* Billing Email */}
      <div>
        <label htmlFor="billing-email" className="block text-sm font-medium text-gray-700 mb-1">
          Billing Email
        </label>
        <input
          id="billing-email"
          type="email"
          value={billingEmail}
          onChange={(e) => setBillingEmail(e.target.value)}
          placeholder="john@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={isProcessing}
          required
        />
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Information
        </label>
        <div className="p-3 border border-gray-300 rounded-md bg-white">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
          />
        </div>
      </div>

      {/* Error Message */}
      {cardError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{cardError}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-start space-x-2 text-sm text-gray-600">
        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p>Your payment information is encrypted and secure. We use Stripe for payment processing.</p>
      </div>

      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Save Payment Method & Subscribe'
          )}
        </button>
        
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
