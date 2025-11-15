/**
 * Stripe Error Handler Utility
 * Maps Stripe error types to user-friendly messages with actionable guidance
 */

export interface StripeErrorDetails {
  message: string;
  action?: string;
  type: string;
}

/**
 * Handle Stripe errors and return user-friendly messages
 */
export function handleStripeError(error: any): StripeErrorDetails {
  // Handle Stripe-specific errors
  if (error.type) {
    switch (error.type) {
      case 'card_error':
        return handleCardError(error);
      
      case 'validation_error':
        return {
          message: 'Please check your card details and try again.',
          action: 'Verify that all card information is correct.',
          type: 'validation_error',
        };
      
      case 'api_error':
        return {
          message: 'Payment processing error. Please try again.',
          action: 'If the problem persists, please contact support.',
          type: 'api_error',
        };
      
      case 'authentication_error':
        return {
          message: 'Payment system error. Please contact support.',
          action: 'Our team will help resolve this issue.',
          type: 'authentication_error',
        };
      
      case 'rate_limit_error':
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          action: 'Wait a few seconds before retrying.',
          type: 'rate_limit_error',
        };
      
      case 'invalid_request_error':
        return {
          message: 'Invalid payment request. Please try again.',
          action: 'If the problem persists, please contact support.',
          type: 'invalid_request_error',
        };
      
      default:
        return {
          message: error.message || 'An unexpected error occurred.',
          action: 'Please try again or contact support if the issue persists.',
          type: error.type || 'unknown',
        };
    }
  }

  // Handle generic errors
  if (error.message) {
    return {
      message: error.message,
      type: 'generic',
    };
  }

  // Fallback error
  return {
    message: 'An unexpected error occurred. Please try again.',
    action: 'Contact support if the problem persists.',
    type: 'unknown',
  };
}

/**
 * Handle card-specific errors with detailed messages
 */
function handleCardError(error: any): StripeErrorDetails {
  const code = error.decline_code || error.code;

  switch (code) {
    case 'card_declined':
      return {
        message: 'Your card was declined.',
        action: 'Please try a different card or contact your bank.',
        type: 'card_declined',
      };
    
    case 'insufficient_funds':
      return {
        message: 'Insufficient funds in your account.',
        action: 'Please use a different card or add funds to your account.',
        type: 'insufficient_funds',
      };
    
    case 'expired_card':
      return {
        message: 'Your card has expired.',
        action: 'Please use a different card with a valid expiration date.',
        type: 'expired_card',
      };
    
    case 'incorrect_cvc':
      return {
        message: 'The security code (CVC) is incorrect.',
        action: 'Please check the 3 or 4-digit code on the back of your card.',
        type: 'incorrect_cvc',
      };
    
    case 'incorrect_number':
      return {
        message: 'The card number is incorrect.',
        action: 'Please check your card number and try again.',
        type: 'incorrect_number',
      };
    
    case 'invalid_expiry_month':
    case 'invalid_expiry_year':
      return {
        message: 'The expiration date is invalid.',
        action: 'Please check the expiration date on your card.',
        type: 'invalid_expiry',
      };
    
    case 'processing_error':
      return {
        message: 'An error occurred while processing your card.',
        action: 'Please try again in a moment.',
        type: 'processing_error',
      };
    
    case 'lost_card':
    case 'stolen_card':
      return {
        message: 'This card cannot be used.',
        action: 'Please contact your bank or use a different card.',
        type: 'card_not_usable',
      };
    
    default:
      return {
        message: error.message || 'Your card was declined.',
        action: 'Please try a different card or contact your bank.',
        type: 'card_error',
      };
  }
}

/**
 * Format error for display in UI
 */
export function formatStripeErrorForDisplay(error: any): string {
  const details = handleStripeError(error);
  
  if (details.action) {
    return `${details.message} ${details.action}`;
  }
  
  return details.message;
}

/**
 * Check if error requires user action
 */
export function requiresUserAction(error: any): boolean {
  const actionableTypes = [
    'card_declined',
    'insufficient_funds',
    'expired_card',
    'incorrect_cvc',
    'incorrect_number',
    'invalid_expiry',
  ];
  
  const details = handleStripeError(error);
  return actionableTypes.includes(details.type);
}
