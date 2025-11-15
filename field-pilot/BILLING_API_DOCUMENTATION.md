# FieldPilot Billing API Documentation

## Overview

This document provides comprehensive API documentation for integrating the FieldPilot billing system into your frontend application. All billing endpoints are only accessible from the public schema (localhost:8000) during onboarding.

**Base URL:** `http://localhost:8000/api/v1/billing/`

---

## Response Format

All API responses follow a standardized format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "timestamp": "2025-11-14T12:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-11-14T12:00:00.000Z"
  }
}
```

---

## Common Error Codes

| HTTP Status | Error Code | Description |
|------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Access denied (wrong schema) |
| 404 | NOT_FOUND | Resource not found |
| 500 | INTERNAL_ERROR | Server error |

---

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Get Subscription Plans

Get all available subscription plans with pricing and features.

**Endpoint:** `GET /api/v1/billing/plans/`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Starter",
      "slug": "starter",
      "description": "Perfect for small teams",
      "price_monthly": "29.00",
      "price_yearly": "290.00",
      "yearly_discount_percentage": 16.7,
      "max_users": 5,
      "max_equipment": 50,
      "max_storage_gb": 10,
      "max_api_calls_per_month": 10000,
      "features": {
        "basic_support": true,
        "mobile_app": true,
        "custom_reports": false
      },
      "is_active": true
    }
  ],
  "message": "Subscription plans retrieved successfully"
}
```

---

### 2. Get Current Subscription

Get the current tenant's subscription details.

**Endpoint:** `GET /api/v1/billing/subscription/`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plan": {
      "id": "uuid",
      "name": "Starter",
      "slug": "starter",
      "price_monthly": "29.00",
      "price_yearly": "290.00",
      "max_users": 5,
      "max_equipment": 50,
      "features": { ... }
    },
    "status": "active",
    "billing_cycle": "monthly",
    "current_period_start": "2025-11-01T00:00:00Z",
    "current_period_end": "2025-12-01T00:00:00Z",
    "cancel_at_period_end": false,
    "canceled_at": null,
    "trial_start": null,
    "trial_end": null,
    "is_active": true,
    "is_trial": false,
    "days_until_renewal": 17,
    "current_users_count": 3,
    "current_equipment_count": 25,
    "current_storage_gb": "5.50",
    "usage_limits_exceeded": [],
    "created_at": "2025-11-01T00:00:00Z"
  },
  "message": "Subscription retrieved successfully"
}
```

**No Subscription Response:**
```json
{
  "success": true,
  "data": null,
  "message": "No active subscription found"
}
```

---

### 3. Create Subscription

Create a new subscription for the tenant. Subscription is managed by the backend; Stripe is optional for payment processing.

**Endpoint:** `POST /api/v1/billing/subscription/create/`

**Authentication:** Required

**Request Body:**
```json
{
  "plan_slug": "starter",
  "billing_cycle": "monthly",
  "payment_method_id": "pm_1234567890"  // Optional - Stripe payment method ID
}
```

**Parameters:**
- `plan_slug` (string, required): Plan identifier (e.g., "starter", "professional", "enterprise")
- `billing_cycle` (string, required): "monthly" or "yearly"
- `payment_method_id` (string, optional): Stripe payment method ID for future charges

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plan": { ... },
    "status": "active",
    "billing_cycle": "monthly",
    "current_period_start": "2025-11-14T12:00:00Z",
    "current_period_end": "2025-12-14T12:00:00Z",
    ...
  },
  "message": "Subscription created successfully"
}
```

**Error Responses:**

**400 - Invalid Plan:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR",
    "message": "Invalid subscription data",
    "details": {
      "plan_slug": ["Invalid or inactive subscription plan."]
    }
  }
}
```

**400 - Already Has Subscription:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR",
    "message": "Tenant already has an active subscription",
    "details": {}
  }
}
```

---

### 4. Update Subscription

Update the current subscription (upgrade/downgrade plan or change billing cycle).

**Endpoint:** `PUT /api/v1/billing/subscription/update/`

**Authentication:** Required

**Request Body:**
```json
{
  "plan_slug": "professional",  // Optional
  "billing_cycle": "yearly",    // Optional
  "cancel_at_period_end": false // Optional
}
```

**Parameters:**
- `plan_slug` (string, optional): New plan identifier
- `billing_cycle` (string, optional): "monthly" or "yearly"
- `cancel_at_period_end` (boolean, optional): Set to true to cancel at period end, false to reactivate

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plan": { ... },
    "status": "active",
    ...
  },
  "message": "Subscription updated successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "ERROR",
    "message": "No active subscription found",
    "details": {}
  }
}
```

---

### 5. Cancel Subscription

Cancel the current subscription immediately or at the end of the billing period.

**Endpoint:** `POST /api/v1/billing/subscription/cancel/`

**Authentication:** Required

**Request Body:**
```json
{
  "cancel_immediately": false,  // Optional, default: false
  "reason": "Switching to another service"  // Optional
}
```

**Parameters:**
- `cancel_immediately` (boolean, optional): If true, cancel immediately; if false, cancel at period end
- `reason` (string, optional): Cancellation reason

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "active",  // or "canceled" if immediate
    "cancel_at_period_end": true,
    "canceled_at": "2025-11-14T12:00:00Z",  // if immediate
    ...
  },
  "message": "Subscription canceled successfully"
}
```

---

### 6. Get Billing Overview

Get comprehensive billing dashboard data including subscription, usage, invoices, and payments.

**Endpoint:** `GET /api/v1/billing/overview/`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "plan": { ... },
      "status": "active",
      ...
    },
    "current_invoice": {
      "id": "uuid",
      "invoice_number": "FP-202511-0001",
      "total": "29.00",
      "status": "open",
      ...
    },
    "recent_payments": [
      {
        "id": "uuid",
        "amount": "29.00",
        "status": "succeeded",
        "created_at": "2025-10-14T12:00:00Z"
      }
    ],
    "usage_summary": {
      "users": {
        "current": 3,
        "limit": 5,
        "percentage": 60.0
      },
      "equipment": {
        "current": 25,
        "limit": 50,
        "percentage": 50.0
      },
      "storage": {
        "current": 5.5,
        "limit": 10,
        "percentage": 55.0
      }
    }
  },
  "message": "Billing overview retrieved successfully"
}
```

---

### 7. Get Invoices

Get list of tenant invoices with pagination.

**Endpoint:** `GET /api/v1/billing/invoices/`

**Authentication:** Required

**Query Parameters:**
- `page` (integer, optional): Page number for pagination
- `page_size` (integer, optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "invoice_number": "FP-202511-0001",
      "subtotal": "29.00",
      "tax": "2.90",
      "total": "31.90",
      "currency": "USD",
      "status": "paid",
      "issue_date": "2025-11-01",
      "due_date": "2025-11-15",
      "paid_at": "2025-11-05T10:30:00Z",
      "invoice_pdf_url": "https://...",
      "period_start": "2025-11-01",
      "period_end": "2025-12-01",
      "created_at": "2025-11-01T00:00:00Z"
    }
  ],
  "message": "Invoices retrieved successfully"
}
```

**Invoice Status Values:**
- `draft`: Invoice is being prepared
- `open`: Invoice is issued and awaiting payment
- `paid`: Invoice has been paid
- `void`: Invoice has been voided
- `uncollectible`: Invoice marked as uncollectible

---

### 8. Get Payments

Get list of tenant payments with pagination.

**Endpoint:** `GET /api/v1/billing/payments/`

**Authentication:** Required

**Query Parameters:**
- `page` (integer, optional): Page number for pagination
- `page_size` (integer, optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": "29.00",
      "currency": "USD",
      "payment_method": "card",
      "status": "succeeded",
      "failure_code": "",
      "failure_message": "",
      "processed_at": "2025-11-05T10:30:00Z",
      "created_at": "2025-11-05T10:29:00Z"
    }
  ],
  "message": "Payments retrieved successfully"
}
```

**Payment Status Values:**
- `pending`: Payment is being processed
- `succeeded`: Payment completed successfully
- `failed`: Payment failed
- `canceled`: Payment was canceled
- `refunded`: Payment was refunded

**Payment Method Values:**
- `card`: Credit/debit card
- `bank_transfer`: Bank transfer
- `ach`: ACH payment
- `wire`: Wire transfer

---

### 9. Create Setup Intent (Stripe)

Create a Stripe setup intent for saving a payment method. This is used to save a card for future recurring charges.

**Endpoint:** `POST /api/v1/billing/setup-intent/`

**Authentication:** Required

**Request Body:** Empty `{}`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "client_secret": "seti_1234567890_secret_abcdefg",
    "customer_id": "cus_1234567890"
  },
  "message": "Setup intent created successfully"
}
```

**Usage Flow:**
1. Call this endpoint to get `client_secret`
2. Use Stripe.js on frontend to confirm the setup intent with card details
3. Get `payment_method_id` from Stripe
4. Use `payment_method_id` when creating subscription

**Error Response (400 - Stripe Not Configured):**
```json
{
  "success": false,
  "error": {
    "code": "ERROR",
    "message": "Stripe payment processing is not enabled. Please configure STRIPE_SECRET_KEY in your .env file.",
    "details": {}
  }
}
```

---

### 10. Add Payment Method

Add a payment method to the customer account.

**Endpoint:** `POST /api/v1/billing/payment-method/add/`

**Authentication:** Required

**Request Body:**
```json
{
  "payment_method_id": "pm_1234567890",
  "set_as_default": true
}
```

**Parameters:**
- `payment_method_id` (string, required): Stripe payment method ID
- `set_as_default` (boolean, optional): Set as default payment method (default: false)

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Payment method added successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "ERROR",
    "message": "No subscription found",
    "details": {}
  }
}
```

---

## Frontend Integration Guide

### 1. Display Subscription Plans

```javascript
// Fetch available plans
const fetchPlans = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/billing/plans/');
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Failed to fetch plans:', error);
  }
};
```

### 2. Create Subscription (Without Stripe)

```javascript
// Create subscription without payment method
const createSubscription = async (planSlug, billingCycle) => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/billing/subscription/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        plan_slug: planSlug,
        billing_cycle: billingCycle
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Failed to create subscription:', error);
  }
};
```

### 3. Create Subscription (With Stripe Payment)

```javascript
// Step 1: Get setup intent
const getSetupIntent = async () => {
  const response = await fetch('http://localhost:8000/api/v1/billing/setup-intent/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result.data;
};

// Step 2: Confirm card with Stripe.js
const confirmCard = async (clientSecret, cardElement) => {
  const stripe = Stripe('your_publishable_key');
  
  const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'Customer Name',
        email: 'customer@example.com'
      }
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return setupIntent.payment_method;
};

// Step 3: Create subscription with payment method
const createSubscriptionWithPayment = async (planSlug, billingCycle, paymentMethodId) => {
  const response = await fetch('http://localhost:8000/api/v1/billing/subscription/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      plan_slug: planSlug,
      billing_cycle: billingCycle,
      payment_method_id: paymentMethodId
    })
  });
  
  const result = await response.json();
  return result.data;
};

// Complete flow
const subscribeWithCard = async (planSlug, billingCycle, cardElement) => {
  try {
    // Get setup intent
    const { client_secret } = await getSetupIntent();
    
    // Confirm card
    const paymentMethodId = await confirmCard(client_secret, cardElement);
    
    // Create subscription
    const subscription = await createSubscriptionWithPayment(
      planSlug, 
      billingCycle, 
      paymentMethodId
    );
    
    return subscription;
  } catch (error) {
    console.error('Subscription failed:', error);
    throw error;
  }
};
```

### 4. Get Current Subscription

```javascript
const getCurrentSubscription = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/billing/subscription/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data; // null if no subscription
    }
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
  }
};
```

### 5. Upgrade/Downgrade Subscription

```javascript
const updateSubscription = async (newPlanSlug, newBillingCycle) => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/billing/subscription/update/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        plan_slug: newPlanSlug,
        billing_cycle: newBillingCycle
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Failed to update subscription:', error);
  }
};
```

### 6. Cancel Subscription

```javascript
const cancelSubscription = async (immediately = false, reason = '') => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/billing/subscription/cancel/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cancel_immediately: immediately,
        reason: reason
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
  }
};
```

### 7. Get Billing Overview

```javascript
const getBillingOverview = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/billing/overview/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error('Failed to fetch billing overview:', error);
  }
};
```

---

## Error Handling Best Practices

### 1. Check Response Success Flag

```javascript
const handleApiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      // Handle error
      const error = result.error;
      console.error(`Error ${error.code}: ${error.message}`);
      
      // Show user-friendly message
      if (error.details) {
        // Validation errors
        Object.keys(error.details).forEach(field => {
          console.error(`${field}: ${error.details[field].join(', ')}`);
        });
      }
      
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
```

### 2. Handle Common Errors

```javascript
const handleBillingError = (error) => {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // Show validation errors to user
      return 'Please check your input and try again';
      
    case 'UNAUTHORIZED':
      // Redirect to login
      window.location.href = '/login';
      break;
      
    case 'FORBIDDEN':
      // Show access denied message
      return 'Access denied. Please use the onboarding portal.';
      
    case 'NOT_FOUND':
      // Resource not found
      return 'Subscription not found';
      
    case 'INTERNAL_ERROR':
      // Server error
      return 'Something went wrong. Please try again later.';
      
    default:
      return error.message || 'An error occurred';
  }
};
```

---

## Usage Limits and Restrictions

### Subscription Status Values

- `active`: Subscription is active and in good standing
- `trialing`: Subscription is in trial period
- `past_due`: Payment failed, subscription still active temporarily
- `canceled`: Subscription has been canceled
- `unpaid`: Payment failed, subscription suspended
- `incomplete`: Initial payment incomplete
- `incomplete_expired`: Initial payment incomplete and expired

### Usage Tracking

The system automatically tracks:
- **Users**: Active user count
- **Equipment**: Total equipment count
- **Storage**: Storage usage in GB
- **API Calls**: Monthly API call count

Check `usage_limits_exceeded` array in subscription response to see which limits are exceeded.

---

## Testing

### Test Without Stripe

You can test the billing system without Stripe by simply not providing `payment_method_id`:

```javascript
// This will create an active subscription without payment processing
await createSubscription('starter', 'monthly');
```

### Test With Stripe

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

---

## Notes

1. **Schema Restriction**: All billing endpoints are restricted to the public schema (localhost:8000). Attempting to access from a tenant subdomain will return a 403 error.

2. **Stripe Optional**: Stripe integration is optional. The subscription system works without it, but payment processing requires Stripe configuration.

3. **Backend-Managed**: Subscriptions are managed by the backend. Stripe is only used for payment processing, not subscription management.

4. **Usage Updates**: Usage counts are automatically updated when fetching subscription details.

5. **Pagination**: Invoice and payment endpoints support pagination using `page` and `page_size` query parameters.

---

## Support

For issues or questions, contact the FieldPilot development team.
