/**
 * Stripe Error Handler Utility
 * Maps Stripe error types to user-friendly messages with actionable guidance
 */

export interface StripeErrorDetails {
  message: string;
  guidance?: string;
  action?: string;
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
          message: 'Invalid card information',
          guidance: 'Please check your card details and try again',
          action: 'verify_card',
        };
      
      case 'api_error':
        return {
          message: 'Payment processing error',
          guidance: 'There was an issue processing your payment. Please try again in a moment.',
          action: 'retry',
        };
      
      case 'authentication_error':
        return {
          message: 'Payment system error',
          guidance: 'There was an authentication issue with the payment system. Please contact support.',
          action: 'contact_support',
        };
      
      case 'rate_limit_error':
        return {
          message: 'Too many requests',
          guidance: 'Please wait a moment and try again.',
          action: 'wait_retry',
        };
      
      case 'invalid_request_error':
        return {
          message: 'Invalid request',
          guidance: 'There was an issue with your request. Please try again or contact support.',
          action: 'contact_support',
        };
      
      default:
        return {
          message: error.message || 'An unexpected error occurred',
          guidance: 'Please try again or contact support if the issue persists.',
          action: 'retry',
        };
    }
  }
  
  // Handle generic errors
  return {
    message: error.message || 'An unexpected error occurred',
    guidance: 'Please try again or contact support if the issue persists.',
    action: 'retry',
  };
}

/**
 * Handle card-specific errors with detailed messages
 */
function handleCardError(error: any): StripeErrorDetails {
  const code = error.code || error.decline_code;
  
  switch (code) {
    case 'card_declined':
      return {
        message: 'Card declined',
        guidance: 'Your card was declined. Please try a different card or contact your bank.',
        action: 'try_different_card',
      };
    
    case 'insufficient_funds':
      return {
        message: 'Insufficient funds',
        guidance: 'Your card has insufficient funds. Please try a different card.',
        action: 'try_different_card',
      };
    
    case 'expired_card':
      return {
        message: 'Card expired',
        guidance: 'Your card has expired. Please use a different card.',
        action: 'try_different_card',
      };
    
    case 'incorrect_cvc':
      return {
        message: 'Incorrect CVC',
        guidance: 'The security code (CVC) you entered is incorrect. Please check and try again.',
        action: 'verify_cvc',
      };
    
    case 'incorrect_number':
      return {
        message: 'Incorrect card number',
        guidance: 'The card number you entered is incorrect. Please check and try again.',
        action: 'verify_card_number',
      };
    
    case 'invalid_expiry_month':
    case 'invalid_expiry_year':
      return {
        message: 'Invalid expiration date',
        guidance: 'The expiration date you entered is invalid. Please check and try again.',
        action: 'verify_expiry',
      };
    
    case 'processing_error':
      return {
        message: 'Processing error',
        guidance: 'An error occurred while processing your card. Please try again.',
        action: 'retry',
      };
    
    case 'lost_card':
    case 'stolen_card':
      return {
        message: 'Card not accepted',
        guidance: 'This card cannot be used. Please try a different card.',
        action: 'try_different_card',
      };
    
    case 'generic_decline':
      return {
        message: 'Card declined',
        guidance: 'Your card was declined. Please contact your bank for more information or try a different card.',
        action: 'contact_bank',
      };
    
    default:
      return {
        message: error.message || 'Card error',
        guidance: 'There was an issue with your card. Please try a different card or contact your bank.',
        action: 'try_different_card',
      };
  }
}

/**
 * Get action button text based on error action
 */
export function getErrorActionText(action: string): string {
  switch (action) {
    case 'try_different_card':
      return 'Try Different Card';
    case 'verify_card':
    case 'verify_card_number':
    case 'verify_cvc':
    case 'verify_expiry':
      return 'Check Card Details';
    case 'contact_bank':
      return 'Contact Bank';
    case 'contact_support':
      return 'Contact Support';
    case 'retry':
    case 'wait_retry':
      return 'Try Again';
    default:
      return 'Try Again';
  }
}
