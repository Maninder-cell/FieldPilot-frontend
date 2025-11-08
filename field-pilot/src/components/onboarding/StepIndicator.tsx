'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const STEP_LABELS = [
  'Company Info',
  'Choose Plan',
  'Payment Setup',
  'Invite Team',
  'Complete',
];

export default function StepIndicator({ currentStep, totalSteps = 5 }: StepIndicatorProps) {
  return (
    <div className="w-full py-6">
      {/* Desktop view */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <React.Fragment key={stepNumber}>
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${isCompleted ? 'bg-teal-600 border-teal-600 text-white' : ''}
                      ${isCurrent ? 'bg-white border-teal-600 text-teal-600' : ''}
                      ${isUpcoming ? 'bg-white border-gray-300 text-gray-400' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{stepNumber}</span>
                    )}
                  </div>
                  <span
                    className={`
                      mt-2 text-xs font-medium text-center
                      ${isCurrent ? 'text-teal-600' : ''}
                      ${isCompleted ? 'text-gray-700' : ''}
                      ${isUpcoming ? 'text-gray-400' : ''}
                    `}
                  >
                    {STEP_LABELS[index]}
                  </span>
                </div>

                {/* Connector line */}
                {stepNumber < totalSteps && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-2 transition-all
                      ${stepNumber < currentStep ? 'bg-teal-600' : 'bg-gray-300'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {STEP_LABELS[currentStep - 1]}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
