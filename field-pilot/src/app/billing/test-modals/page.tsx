'use client';

import React, { useState } from 'react';
import { CancelSubscriptionModal } from '@/components/billing/CancelSubscriptionModal';
import { UpgradeDowngradeModal } from '@/components/billing/UpgradeDowngradeModal';
import { SubscriptionPlan } from '@/types/billing';

// Mock plans for testing
const mockCurrentPlan: SubscriptionPlan = {
  id: '1',
  name: 'Professional',
  slug: 'professional',
  description: 'For growing teams',
  price_monthly: '49.00',
  price_yearly: '490.00',
  yearly_discount_percentage: 17,
  max_users: 10,
  max_equipment: 100,
  max_storage_gb: 50,
  max_api_calls_per_month: 10000,
  features: {},
  is_active: true,
};

const mockNewPlan: SubscriptionPlan = {
  id: '2',
  name: 'Enterprise',
  slug: 'enterprise',
  description: 'For large organizations',
  price_monthly: '99.00',
  price_yearly: '990.00',
  yearly_discount_percentage: 17,
  max_users: 50,
  max_equipment: 500,
  max_storage_gb: 200,
  max_api_calls_per_month: 50000,
  features: {},
  is_active: true,
};

export default function TestModalsPage() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Modal Testing Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Modals</h2>
            <p className="text-gray-600 mb-4">
              Click the buttons below to test the modal functionality
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                console.log('Opening Cancel Modal');
                setShowCancelModal(true);
              }}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Test Cancel Subscription Modal
            </button>

            <button
              onClick={() => {
                console.log('Opening Upgrade Modal');
                setShowUpgradeModal(true);
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Test Upgrade/Downgrade Modal
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Modal States:</h3>
            <p className="text-sm">Cancel Modal: {showCancelModal ? 'OPEN' : 'CLOSED'}</p>
            <p className="text-sm">Upgrade Modal: {showUpgradeModal ? 'OPEN' : 'CLOSED'}</p>
          </div>
        </div>

        {/* Modals */}
        <CancelSubscriptionModal
          isOpen={showCancelModal}
          onClose={() => {
            console.log('Closing Cancel Modal');
            setShowCancelModal(false);
          }}
          onSuccess={() => {
            console.log('Cancel Success');
            setShowCancelModal(false);
          }}
        />

        <UpgradeDowngradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            console.log('Closing Upgrade Modal');
            setShowUpgradeModal(false);
          }}
          currentPlan={mockCurrentPlan}
          newPlan={mockNewPlan}
          currentBillingCycle="monthly"
          onSuccess={() => {
            console.log('Upgrade Success');
            setShowUpgradeModal(false);
          }}
        />
      </div>
    </div>
  );
}
