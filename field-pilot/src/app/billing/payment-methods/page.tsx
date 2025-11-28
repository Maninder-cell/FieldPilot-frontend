'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PaymentMethodForm } from '@/components/billing/PaymentMethodForm';
import { StripeProvider } from '@/components/billing/StripeProvider';
import { getPaymentMethods, setDefaultPaymentMethod, removePaymentMethod } from '@/lib/billing-api';
import { getAccessToken } from '@/lib/token-utils';

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default?: boolean;
}

export default function PaymentMethodsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const methods = await getPaymentMethods(accessToken);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      setErrorMessage('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleSuccess = () => {
    setShowAddForm(false);
    setSuccessMessage('Payment method added successfully!');
    setTimeout(() => setSuccessMessage(null), 5000);
    loadPaymentMethods();
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setIsProcessing(true);
      const accessToken = getAccessToken();
      if (!accessToken) return;

      await setDefaultPaymentMethod(paymentMethodId, accessToken);
      setSuccessMessage('Default payment method updated!');
      setTimeout(() => setSuccessMessage(null), 5000);
      loadPaymentMethods();
    } catch (error) {
      setErrorMessage('Failed to set default payment method');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      setIsProcessing(true);
      const accessToken = getAccessToken();
      if (!accessToken) return;

      await removePaymentMethod(paymentMethodId, accessToken);
      setSuccessMessage('Payment method removed successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
      loadPaymentMethods();
    } catch (error) {
      setErrorMessage('Failed to remove payment method');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="mt-2 text-gray-600">
            Manage your payment methods for subscription billing
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Payment Methods List */}
            {!showAddForm && paymentMethods.length > 0 && (
              <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Card Icon */}
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>

                        {/* Card Details */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold text-gray-900 capitalize">
                              {method.card?.brand || method.type}
                            </span>
                            <span className="text-gray-600">••••</span>
                            <span className="text-gray-900 font-medium">{method.card?.last4}</span>
                            {method.is_default && (
                              <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          {method.card && (
                            <p className="text-sm text-gray-600 mt-1">
                              Expires {method.card.exp_month}/{method.card.exp_year}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {!method.is_default && (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(method.id)}
                          disabled={isProcessing}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Payment Method Button */}
            {!showAddForm && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Payment Method
                </button>
              </div>
            )}
          </>
        )}

        {/* Add Payment Method Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Add New Payment Method</h2>
              <p className="text-gray-600">
                Your payment information is encrypted and secure
              </p>
            </div>

            <StripeProvider>
              <PaymentMethodForm
                onSuccess={handleSuccess}
                onCancel={() => setShowAddForm(false)}
                showCancel={true}
              />
            </StripeProvider>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Payment Methods</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>Your payment information is securely processed by Stripe</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>We never store your full card details on our servers</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>You can update or remove payment methods at any time</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>All transactions are encrypted with industry-standard SSL</p>
            </div>
          </div>
        </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
