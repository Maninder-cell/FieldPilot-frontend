# Backend API Reference

**Version:** 1.0.0  
**Last Updated:** November 3, 2025

## Table of Contents

1. [Introduction](#introduction)
2. [Base Configuration](#base-configuration)
3. [Authentication & Authorization](#authentication--authorization)
4. [Response Format Standards](#response-format-standards)
5. [Authentication Endpoints](#authentication-endpoints)
6. [Tenant/Onboarding Endpoints](#tenantonboarding-endpoints)
7. [Billing Endpoints](#billing-endpoints)
8. [Core Endpoints](#core-endpoints)
9. [Data Models](#data-models)
10. [Error Handling](#error-handling)

---

## Introduction

This document provides complete backend API specifications for frontend integration. All endpoints use RESTful conventions and return JSON responses.

**Key Features:**
- JWT-based authentication
- Multi-tenant architecture
- Subscription billing with Stripe integration
- Email verification with OTP
- Role-based access control (Owner, Admin, Employee)

---

## Base Configuration

### Base URL

**Development:** `http://localhost:8000/api/`  
**Production:** `https://your-domain.com/api/`

### Content Type

All requests and responses use:
```
Content-Type: application/json
```

### Common Headers

```http
Content-Type: application/json
Authorization: Bearer {access_token}  # For authenticated requests
```


---

## Authentication & Authorization

### JWT Token Structure

The API uses JWT (JSON Web Tokens) for authentication. After successful login, you receive:

- **Access Token**: Short-lived token (15 minutes) for API requests
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens

### Authentication Header Format

For authenticated endpoints, include the access token in the Authorization header:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Token Refresh Flow

When the access token expires (after 15 minutes):
1. Call `POST /api/auth/token/refresh/` with the refresh token
2. Receive a new access token
3. Update your stored access token
4. Retry the original request

### Permission Levels

- **Owner**: Full access to all tenant resources, can manage billing and members
- **Admin**: Can manage tenant settings and invite members
- **Employee**: Standard user access, limited management capabilities

### Public vs Authenticated Endpoints

**Public (No Authentication Required):**
- User registration
- User login
- Email verification
- Password reset
- Subscription plans list
- Health check

**Authenticated (Requires Bearer Token):**
- All other endpoints


---

## Response Format Standards

### Success Response Structure

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response Structure

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field_name": ["Error message for this field"]
  }
}
```

### Pagination Format

Paginated list endpoints return:

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "count": 100,
  "next": "http://api.example.com/endpoint/?page=2",
  "previous": null
}
```

### Common HTTP Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input data or validation error
- **401 Unauthorized**: Authentication required or invalid credentials
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service temporarily unavailable


---

## Authentication Endpoints

### 1. Register User

Create a new user account. An OTP code will be sent to the provided email for verification.

- **URL**: `/api/auth/register/`
- **Method**: `POST`
- **Authentication**: Not Required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "employee"
}
```

**Field Descriptions**:
- `email` (string, required): User's email address
- `password` (string, required): Password (min 8 chars, must include uppercase, lowercase, number)
- `password_confirm` (string, required): Password confirmation (must match password)
- `first_name` (string, required): User's first name
- `last_name` (string, required): User's last name
- `phone` (string, optional): Phone number with country code
- `role` (string, optional): User role - choices: "owner", "admin", "employee" (default: "employee")

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "avatar_url": null,
      "role": "employee",
      "employee_id": "EMP001",
      "department": null,
      "job_title": null,
      "is_active": true,
      "is_verified": false,
      "two_factor_enabled": false,
      "created_at": "2025-11-03T10:00:00Z",
      "last_login_at": null
    }
  }
}
```

**Error Responses**:

*400 Bad Request - Email already exists*:
```json
{
  "success": false,
  "message": "Invalid registration data",
  "details": {
    "email": ["A user with this email already exists."]
  }
}
```

*400 Bad Request - Password validation failed*:
```json
{
  "success": false,
  "message": "Invalid registration data",
  "details": {
    "password": ["This password is too common.", "Password must contain at least one uppercase letter."]
  }
}
```

*400 Bad Request - Passwords don't match*:
```json
{
  "success": false,
  "message": "Invalid registration data",
  "details": {
    "non_field_errors": ["Passwords don't match."]
  }
}
```


---

### 2. Login User

Authenticate user and receive JWT tokens.

- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Authentication**: Not Required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": false
}
```

**Field Descriptions**:
- `email` (string, required): User's email address
- `password` (string, required): User's password
- `remember_me` (boolean, optional): Keep user logged in longer (default: false)

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "avatar_url": null,
      "role": "employee",
      "employee_id": "EMP001",
      "department": "Engineering",
      "job_title": "Software Engineer",
      "is_active": true,
      "is_verified": true,
      "two_factor_enabled": false,
      "created_at": "2025-11-03T10:00:00Z",
      "last_login_at": "2025-11-03T14:30:00Z"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    },
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

**Error Responses**:

*401 Unauthorized - Invalid credentials*:
```json
{
  "success": false,
  "message": "Invalid login credentials",
  "details": {
    "non_field_errors": ["Invalid email or password."]
  }
}
```

*401 Unauthorized - Email not verified*:
```json
{
  "success": false,
  "message": "Please verify your email before logging in.",
  "code": "EMAIL_NOT_VERIFIED"
}
```

*401 Unauthorized - Account disabled*:
```json
{
  "success": false,
  "message": "Invalid login credentials",
  "details": {
    "non_field_errors": ["User account is disabled."]
  }
}
```


---

### 3. Logout User

Logout user and blacklist refresh token.

- **URL**: `/api/auth/logout/`
- **Method**: `POST`
- **Authentication**: Required

**Request Body**:
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Field Descriptions**:
- `refresh_token` (string, required): The refresh token to blacklist

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Responses**:

*400 Bad Request - Invalid token*:
```json
{
  "success": false,
  "message": "Logout failed"
}
```

---

### 4. Refresh Access Token

Get a new access token using a valid refresh token.

- **URL**: `/api/auth/token/refresh/`
- **Method**: `POST`
- **Authentication**: Not Required (uses refresh token)

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Field Descriptions**:
- `refresh` (string, required): Valid refresh token

**Success Response (200)**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Responses**:

*401 Unauthorized - Invalid or expired token*:
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```


---

### 5. Verify Email

Verify user email address with OTP code.

- **URL**: `/api/auth/verify-email/`
- **Method**: `POST`
- **Authentication**: Not Required

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

**Field Descriptions**:
- `email` (string, required): User's email address
- `otp_code` (string, required): 6-digit OTP code sent to email

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_verified": true
    }
  }
}
```

**Error Responses**:

*400 Bad Request - Invalid or expired OTP*:
```json
{
  "success": false,
  "message": "Invalid verification data",
  "details": {
    "non_field_errors": ["Invalid or expired OTP code."]
  }
}
```

*400 Bad Request - Email already verified*:
```json
{
  "success": false,
  "message": "Invalid verification data",
  "details": {
    "non_field_errors": ["Email is already verified."]
  }
}
```

---

### 6. Resend OTP

Resend OTP code for email verification or password reset.

- **URL**: `/api/auth/resend-otp/`
- **Method**: `POST`
- **Authentication**: Not Required

**Request Body**:
```json
{
  "email": "user@example.com",
  "purpose": "email_verification"
}
```

**Field Descriptions**:
- `email` (string, required): User's email address
- `purpose` (string, required): Purpose of OTP - choices: "email_verification", "password_reset"

**Success Response (200)**:
```json
{
  "success": true,
  "message": "OTP sent successfully. Please check your email."
}
```

**Error Responses**:

*400 Bad Request - Email already verified (for email_verification purpose)*:
```json
{
  "success": false,
  "message": "Invalid request data",
  "details": {
    "non_field_errors": ["Email is already verified."]
  }
}
```


---

### 7. Forgot Password

Request password reset OTP to be sent to email.

- **URL**: `/api/auth/forgot-password/`
- **Method**: `POST`
- **Authentication**: Not Required

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Field Descriptions**:
- `email` (string, required): User's email address

**Success Response (200)**:
```json
{
  "success": true,
  "message": "If the email exists, a password reset code has been sent."
}
```

**Note**: For security reasons, this endpoint always returns success, even if the email doesn't exist.

---

### 8. Reset Password

Reset password using OTP verification.

- **URL**: `/api/auth/reset-password/`
- **Method**: `POST`
- **Authentication**: Not Required

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp_code": "123456",
  "new_password": "NewSecurePass123!",
  "new_password_confirm": "NewSecurePass123!"
}
```

**Field Descriptions**:
- `email` (string, required): User's email address
- `otp_code` (string, required): 6-digit OTP code sent to email
- `new_password` (string, required): New password
- `new_password_confirm` (string, required): New password confirmation

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

**Error Responses**:

*400 Bad Request - Invalid OTP*:
```json
{
  "success": false,
  "message": "Invalid reset data",
  "details": {
    "non_field_errors": ["Invalid or expired OTP code."]
  }
}
```

*400 Bad Request - Passwords don't match*:
```json
{
  "success": false,
  "message": "Invalid reset data",
  "details": {
    "non_field_errors": ["Passwords don't match."]
  }
}
```


---

### 9. Change Password

Change password for authenticated user.

- **URL**: `/api/auth/change-password/`
- **Method**: `POST`
- **Authentication**: Required

**Request Body**:
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePass123!",
  "new_password_confirm": "NewSecurePass123!"
}
```

**Field Descriptions**:
- `current_password` (string, required): Current password
- `new_password` (string, required): New password
- `new_password_confirm` (string, required): New password confirmation

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses**:

*400 Bad Request - Incorrect current password*:
```json
{
  "success": false,
  "message": "Invalid password data",
  "details": {
    "non_field_errors": ["Current password is incorrect."]
  }
}
```

*400 Bad Request - Passwords don't match*:
```json
{
  "success": false,
  "message": "Invalid password data",
  "details": {
    "non_field_errors": ["New passwords don't match."]
  }
}
```

---

### 10. Get Current User Info

Retrieve information about the currently authenticated user.

- **URL**: `/api/auth/me/`
- **Method**: `GET`
- **Authentication**: Required

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "avatar_url": "https://example.com/avatar.jpg",
    "role": "employee",
    "employee_id": "EMP001",
    "department": "Engineering",
    "job_title": "Software Engineer",
    "is_active": true,
    "is_verified": true,
    "two_factor_enabled": false,
    "created_at": "2025-11-03T10:00:00Z",
    "last_login_at": "2025-11-03T14:30:00Z"
  }
}
```


---

### 11. Get User Profile

Get detailed user profile information.

- **URL**: `/api/auth/profile/`
- **Method**: `GET`
- **Authentication**: Required

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "phone": "+1234567890",
      "avatar_url": "https://example.com/avatar.jpg",
      "role": "employee",
      "employee_id": "EMP001",
      "department": "Engineering",
      "job_title": "Software Engineer",
      "is_active": true,
      "is_verified": true,
      "two_factor_enabled": false,
      "created_at": "2025-11-03T10:00:00Z",
      "last_login_at": "2025-11-03T14:30:00Z"
    },
    "date_of_birth": "1990-01-15",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+1234567891",
    "emergency_contact_relationship": "Spouse",
    "hire_date": "2023-01-15",
    "skills": ["Python", "JavaScript", "React"],
    "certifications": ["AWS Certified"],
    "timezone": "America/New_York",
    "language": "en",
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true
  }
}
```

---

### 12. Update User Profile

Update user profile information.

- **URL**: `/api/auth/profile/update/`
- **Method**: `PUT`
- **Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar_url": "https://example.com/avatar.jpg",
  "department": "Engineering",
  "job_title": "Senior Software Engineer",
  "date_of_birth": "1990-01-15",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "country": "USA",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1234567891",
  "emergency_contact_relationship": "Spouse",
  "skills": ["Python", "JavaScript", "React"],
  "certifications": ["AWS Certified"],
  "timezone": "America/New_York",
  "language": "en",
  "email_notifications": true,
  "sms_notifications": false,
  "push_notifications": true
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Same structure as Get User Profile response
  }
}
```

**Error Responses**:

*400 Bad Request - Invalid data*:
```json
{
  "success": false,
  "message": "Invalid profile data",
  "details": {
    "phone": ["Enter a valid phone number."]
  }
}
```


---

## Tenant/Onboarding Endpoints

### 1. Create Tenant/Company

Create a new company/tenant and add the current user as owner. Automatically starts a 14-day trial.

- **URL**: `/api/tenants/create/`
- **Method**: `POST`
- **Authentication**: Required

**Request Body**:
```json
{
  "name": "Acme Corporation",
  "company_email": "contact@acme.com",
  "company_phone": "+1234567890",
  "website": "https://acme.com",
  "company_size": "11-50",
  "industry": "Manufacturing",
  "address": "456 Business Ave",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "country": "USA"
}
```

**Field Descriptions**:
- `name` (string, required): Company name (must be unique)
- `company_email` (string, required): Company contact email
- `company_phone` (string, optional): Company phone number
- `website` (string, optional): Company website URL
- `company_size` (string, optional): Company size - choices: "1-10", "11-50", "51-200", "201-500", "501+"
- `industry` (string, optional): Industry type
- `address` (string, optional): Street address
- `city` (string, optional): City
- `state` (string, optional): State/Province
- `zip_code` (string, optional): Postal code
- `country` (string, optional): Country

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "id": 1,
    "name": "Acme Corporation",
    "slug": "acme-corporation",
    "company_email": "contact@acme.com",
    "company_phone": "+1234567890",
    "website": "https://acme.com",
    "company_size": "11-50",
    "industry": "Manufacturing",
    "address": "456 Business Ave",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA",
    "is_active": true,
    "trial_ends_at": "2025-11-17T10:00:00Z",
    "is_trial_active": true,
    "onboarding_completed": false,
    "onboarding_step": 1,
    "member_count": 1,
    "created_at": "2025-11-03T10:00:00Z",
    "updated_at": "2025-11-03T10:00:00Z"
  }
}
```

**Error Responses**:

*400 Bad Request - Company name already exists*:
```json
{
  "success": false,
  "message": "Invalid company data",
  "details": {
    "name": ["A company with this name already exists."]
  }
}
```


---

### 2. Get Current Tenant

Get current user's tenant/company information.

- **URL**: `/api/tenants/current/`
- **Method**: `GET`
- **Authentication**: Required

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Tenant retrieved successfully",
  "data": {
    "id": 1,
    "name": "Acme Corporation",
    "slug": "acme-corporation",
    "company_email": "contact@acme.com",
    "company_phone": "+1234567890",
    "website": "https://acme.com",
    "company_size": "11-50",
    "industry": "Manufacturing",
    "address": "456 Business Ave",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA",
    "is_active": true,
    "trial_ends_at": "2025-11-17T10:00:00Z",
    "is_trial_active": true,
    "onboarding_completed": false,
    "onboarding_step": 2,
    "member_count": 3,
    "created_at": "2025-11-03T10:00:00Z",
    "updated_at": "2025-11-03T10:00:00Z"
  }
}
```

**Success Response (200) - No tenant found**:
```json
{
  "success": true,
  "message": "No company found for this user",
  "data": null
}
```

---

### 3. Update Tenant

Update tenant/company information. Only owners and admins can update.

- **URL**: `/api/tenants/update/`
- **Method**: `PUT`
- **Authentication**: Required
- **Permissions**: Owner, Admin

**Request Body** (all fields optional):
```json
{
  "name": "Acme Corporation Inc",
  "company_email": "info@acme.com",
  "company_phone": "+1234567890",
  "website": "https://acme.com",
  "company_size": "51-200",
  "industry": "Manufacturing",
  "address": "789 Business Blvd",
  "city": "New York",
  "state": "NY",
  "zip_code": "10002",
  "country": "USA"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    // Same structure as Get Current Tenant response
  }
}
```

**Error Responses**:

*403 Forbidden - Insufficient permissions*:
```json
{
  "success": false,
  "message": "Only owners and admins can update company information"
}
```

*404 Not Found - No tenant found*:
```json
{
  "success": false,
  "message": "No company found"
}
```


---

### 4. Complete Onboarding Step

Mark an onboarding step as complete and move to next step.

- **URL**: `/api/tenants/onboarding/step/`
- **Method**: `POST`
- **Authentication**: Required

**Request Body**:
```json
{
  "step": 2,
  "data": {
    "custom_field": "value"
  }
}
```

**Field Descriptions**:
- `step` (integer, required): Step number (1-5)
- `data` (object, optional): Additional data for the step

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Onboarding step 2 completed",
  "data": {
    // Same structure as Get Current Tenant response
    "onboarding_step": 2,
    "onboarding_completed": false
  }
}
```

**Note**: When step 5 is completed, `onboarding_completed` will be set to `true`.

---

### 5. Get Tenant Members

Get list of all members in the tenant.

- **URL**: `/api/tenants/members/`
- **Method**: `GET`
- **Authentication**: Required

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Members retrieved successfully",
  "data": [
    {
      "id": 1,
      "tenant": 1,
      "user": {
        "id": 1,
        "email": "owner@acme.com",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "phone": "+1234567890",
        "avatar_url": null,
        "role": "owner",
        "employee_id": "EMP001",
        "department": "Management",
        "job_title": "CEO",
        "is_active": true,
        "is_verified": true,
        "two_factor_enabled": false,
        "created_at": "2025-11-03T10:00:00Z",
        "last_login_at": "2025-11-03T14:30:00Z"
      },
      "role": "owner",
      "is_active": true,
      "joined_at": "2025-11-03T10:00:00Z"
    },
    {
      "id": 2,
      "tenant": 1,
      "user": {
        "id": 2,
        "email": "admin@acme.com",
        "first_name": "Jane",
        "last_name": "Smith",
        "full_name": "Jane Smith",
        "phone": "+1234567891",
        "avatar_url": null,
        "role": "admin",
        "employee_id": "EMP002",
        "department": "Operations",
        "job_title": "Operations Manager",
        "is_active": true,
        "is_verified": true,
        "two_factor_enabled": false,
        "created_at": "2025-11-03T11:00:00Z",
        "last_login_at": "2025-11-03T13:00:00Z"
      },
      "role": "admin",
      "is_active": true,
      "joined_at": "2025-11-03T11:00:00Z"
    }
  ]
}
```


---

### 6. Invite Member

Invite a new member to the tenant. Only owners and admins can invite.

- **URL**: `/api/tenants/members/invite/`
- **Method**: `POST`
- **Authentication**: Required
- **Permissions**: Owner, Admin

**Request Body**:
```json
{
  "email": "newmember@example.com",
  "role": "employee",
  "first_name": "Bob",
  "last_name": "Johnson"
}
```

**Field Descriptions**:
- `email` (string, required): Email address of the person to invite
- `role` (string, required): Role to assign - choices: "owner", "admin", "employee"
- `first_name` (string, optional): First name
- `last_name` (string, optional): Last name

**Success Response (200) - User already exists**:
```json
{
  "success": true,
  "message": "User newmember@example.com added to company"
}
```

**Success Response (200) - New user invitation**:
```json
{
  "success": true,
  "message": "Invitation sent to newmember@example.com. They need to register with this email to join."
}
```

**Error Responses**:

*400 Bad Request - User already a member*:
```json
{
  "success": false,
  "message": "User is already a member of this company"
}
```

*400 Bad Request - Invitation already sent*:
```json
{
  "success": false,
  "message": "An invitation has already been sent to newmember@example.com"
}
```

*403 Forbidden - Insufficient permissions*:
```json
{
  "success": false,
  "message": "Only owners and admins can invite members"
}
```

---

### 7. Get Pending Invitations

Get list of pending invitations for the tenant. Only owners and admins can view.

- **URL**: `/api/tenants/invitations/pending/`
- **Method**: `GET`
- **Authentication**: Required
- **Permissions**: Owner, Admin

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Found 2 pending invitations",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "newmember@example.com",
      "role": "employee",
      "invited_by": "owner@acme.com",
      "created_at": "2025-11-03T10:00:00Z",
      "expires_at": "2025-11-10T10:00:00Z",
      "is_valid": true
    }
  ]
}
```


---

### 8. Check User Invitations

Check if the current user has any pending invitations.

- **URL**: `/api/tenants/invitations/check/`
- **Method**: `GET`
- **Authentication**: Required

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Found 1 pending invitations",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "tenant_name": "Acme Corporation",
      "role": "employee",
      "invited_by": "owner@acme.com",
      "created_at": "2025-11-03T10:00:00Z",
      "expires_at": "2025-11-10T10:00:00Z"
    }
  ]
}
```

---

### 9. Accept Invitation

Accept a pending invitation to join a tenant.

- **URL**: `/api/tenants/invitations/{invitation_id}/accept/`
- **Method**: `POST`
- **Authentication**: Required

**URL Parameters**:
- `invitation_id` (UUID, required): The invitation ID

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Successfully joined Acme Corporation",
  "data": {
    "tenant_name": "Acme Corporation",
    "role": "employee"
  }
}
```

**Error Responses**:

*400 Bad Request - Invitation expired*:
```json
{
  "success": false,
  "message": "This invitation has expired"
}
```

*400 Bad Request - Already a member*:
```json
{
  "success": false,
  "message": "You are already a member of this company"
}
```

*404 Not Found - Invitation not found*:
```json
{
  "success": false,
  "message": "Invitation not found"
}
```


---

## Billing Endpoints

### 1. Get Subscription Plans

Get all available subscription plans with pricing and features. Public endpoint.

- **URL**: `/api/billing/plans/`
- **Method**: `GET`
- **Authentication**: Not Required

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Subscription plans retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Starter",
      "slug": "starter",
      "description": "Perfect for small teams getting started",
      "price_monthly": "29.00",
      "price_yearly": "290.00",
      "yearly_discount_percentage": 16.67,
      "max_users": 5,
      "max_equipment": 50,
      "max_storage_gb": 10,
      "max_api_calls_per_month": 10000,
      "features": [
        "Basic equipment tracking",
        "Work order management",
        "Mobile app access",
        "Email support"
      ],
      "is_active": true
    },
    {
      "id": 2,
      "name": "Professional",
      "slug": "professional",
      "description": "For growing teams with advanced needs",
      "price_monthly": "79.00",
      "price_yearly": "790.00",
      "yearly_discount_percentage": 16.67,
      "max_users": 20,
      "max_equipment": 200,
      "max_storage_gb": 50,
      "max_api_calls_per_month": 50000,
      "features": [
        "Everything in Starter",
        "Advanced analytics",
        "Custom fields",
        "API access",
        "Priority support"
      ],
      "is_active": true
    },
    {
      "id": 3,
      "name": "Enterprise",
      "slug": "enterprise",
      "description": "For large organizations with custom requirements",
      "price_monthly": "199.00",
      "price_yearly": "1990.00",
      "yearly_discount_percentage": 16.67,
      "max_users": null,
      "max_equipment": null,
      "max_storage_gb": 500,
      "max_api_calls_per_month": null,
      "features": [
        "Everything in Professional",
        "Unlimited users",
        "Unlimited equipment",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee"
      ],
      "is_active": true
    }
  ]
}
```

**Note**: `null` values for limits mean unlimited.


---

### 2. Get Current Subscription

Get current tenant's subscription details including usage and billing information.

- **URL**: `/api/billing/subscription/`
- **Method**: `GET`
- **Authentication**: Required

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Subscription retrieved successfully",
  "data": {
    "id": 1,
    "plan": {
      "id": 2,
      "name": "Professional",
      "slug": "professional",
      "description": "For growing teams with advanced needs",
      "price_monthly": "79.00",
      "price_yearly": "790.00",
      "yearly_discount_percentage": 16.67,
      "max_users": 20,
      "max_equipment": 200,
      "max_storage_gb": 50,
      "max_api_calls_per_month": 50000,
      "features": [
        "Everything in Starter",
        "Advanced analytics",
        "Custom fields",
        "API access",
        "Priority support"
      ],
      "is_active": true
    },
    "status": "active",
    "billing_cycle": "monthly",
    "current_period_start": "2025-11-03T10:00:00Z",
    "current_period_end": "2025-12-03T10:00:00Z",
    "cancel_at_period_end": false,
    "canceled_at": null,
    "trial_start": null,
    "trial_end": null,
    "is_active": true,
    "is_trial": false,
    "days_until_renewal": 30,
    "current_users_count": 8,
    "current_equipment_count": 45,
    "current_storage_gb": "12.50",
    "usage_limits_exceeded": [],
    "created_at": "2025-11-03T10:00:00Z"
  }
}
```

**Success Response (200) - No subscription**:
```json
{
  "success": true,
  "message": "No active subscription found",
  "data": null
}
```

**Field Descriptions**:
- `status` (string): Subscription status - values: "active", "past_due", "canceled", "incomplete"
- `billing_cycle` (string): Billing cycle - values: "monthly", "yearly"
- `is_active` (boolean): Whether subscription is currently active
- `is_trial` (boolean): Whether subscription is in trial period
- `days_until_renewal` (integer): Days until next billing period
- `usage_limits_exceeded` (array): List of exceeded limits (e.g., ["users", "equipment"])


---

### 3. Create Subscription

Create a new subscription for the tenant. Subscription is managed by backend; Stripe payment is optional.

- **URL**: `/api/billing/subscription/create/`
- **Method**: `POST`
- **Authentication**: Required
- **Permissions**: Owner, Admin

**Request Body**:
```json
{
  "plan_slug": "professional",
  "billing_cycle": "monthly",
  "payment_method_id": "pm_1234567890"
}
```

**Field Descriptions**:
- `plan_slug` (string, required): Plan slug (from subscription plans)
- `billing_cycle` (string, required): Billing cycle - choices: "monthly", "yearly"
- `payment_method_id` (string, optional): Stripe payment method ID (from setup intent)

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    // Same structure as Get Current Subscription response
  }
}
```

**Error Responses**:

*400 Bad Request - Tenant already has subscription*:
```json
{
  "success": false,
  "message": "Tenant already has an active subscription"
}
```

*400 Bad Request - Invalid plan*:
```json
{
  "success": false,
  "message": "Invalid subscription data",
  "details": {
    "plan_slug": ["Invalid or inactive subscription plan."]
  }
}
```

**Note**: If `payment_method_id` is provided, it will be linked to the subscription for future recurring charges. If Stripe is not configured, the subscription will still be created but payment method linking will be skipped.

---

### 4. Update Subscription

Update subscription plan or billing cycle (upgrade/downgrade).

- **URL**: `/api/billing/subscription/update/`
- **Method**: `PUT`
- **Authentication**: Required
- **Permissions**: Owner, Admin

**Request Body**:
```json
{
  "plan_slug": "enterprise",
  "billing_cycle": "yearly",
  "cancel_at_period_end": false
}
```

**Field Descriptions** (all optional):
- `plan_slug` (string): New plan slug
- `billing_cycle` (string): New billing cycle - choices: "monthly", "yearly"
- `cancel_at_period_end` (boolean): Schedule cancellation at period end

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    // Same structure as Get Current Subscription response
  }
}
```

**Error Responses**:

*404 Not Found - No subscription*:
```json
{
  "success": false,
  "message": "No active subscription found"
}
```


---

### 5. Cancel Subscription

Cancel current subscription immediately or at period end.

- **URL**: `/api/billing/subscription/cancel/`
- **Method**: `POST`
- **Authentication**: Required
- **Permissions**: Owner, Admin

**Request Body**:
```json
{
  "cancel_immediately": false,
  "reason": "Switching to different solution"
}
```

**Field Descriptions**:
- `cancel_immediately` (boolean, optional): Cancel immediately vs at period end (default: false)
- `reason` (string, optional): Cancellation reason

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Subscription canceled successfully",
  "data": {
    // Same structure as Get Current Subscription response
    "cancel_at_period_end": true,
    "canceled_at": "2025-11-03T15:00:00Z"
  }
}
```

**Error Responses**:

*404 Not Found - No subscription*:
```json
{
  "success": false,
  "message": "No active subscription found"
}
```

---

### 6. Get Billing Overview

Get billing dashboard with subscription, usage, and payment information.

- **URL**: `/api/billing/overview/`
- **Method**: `GET`
- **Authentication**: Required

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Billing overview retrieved successfully",
  "data": {
    "subscription": {
      // Same structure as Get Current Subscription response
    },
    "current_invoice": {
      "id": 1,
      "invoice_number": "INV-2025-001",
      "subtotal": "79.00",
      "tax": "7.90",
      "total": "86.90",
      "currency": "USD",
      "status": "open",
      "issue_date": "2025-11-03",
      "due_date": "2025-11-10",
      "paid_at": null,
      "invoice_pdf_url": "https://example.com/invoices/INV-2025-001.pdf",
      "period_start": "2025-11-03",
      "period_end": "2025-12-03",
      "created_at": "2025-11-03T10:00:00Z"
    },
    "recent_payments": [
      {
        "id": 1,
        "amount": "79.00",
        "currency": "USD",
        "payment_method": "card",
        "status": "succeeded",
        "failure_code": null,
        "failure_message": null,
        "processed_at": "2025-10-03T10:00:00Z",
        "created_at": "2025-10-03T10:00:00Z"
      }
    ],
    "usage_summary": {
      "users": {
        "current": 8,
        "limit": 20,
        "percentage": 40.0
      },
      "equipment": {
        "current": 45,
        "limit": 200,
        "percentage": 22.5
      },
      "storage": {
        "current": 12.5,
        "limit": 50,
        "percentage": 25.0
      }
    }
  }
}
```


---

### 7. Get Invoices

Get list of tenant invoices with pagination.

- **URL**: `/api/billing/invoices/`
- **Method**: `GET`
- **Authentication**: Required

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `page_size` (integer, optional): Items per page (default: 10)

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Invoices retrieved successfully",
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-2025-001",
      "subtotal": "79.00",
      "tax": "7.90",
      "total": "86.90",
      "currency": "USD",
      "status": "paid",
      "issue_date": "2025-11-03",
      "due_date": "2025-11-10",
      "paid_at": "2025-11-03T12:00:00Z",
      "invoice_pdf_url": "https://example.com/invoices/INV-2025-001.pdf",
      "period_start": "2025-11-03",
      "period_end": "2025-12-03",
      "created_at": "2025-11-03T10:00:00Z"
    }
  ],
  "count": 12,
  "next": "http://localhost:8000/api/billing/invoices/?page=2",
  "previous": null
}
```

**Field Descriptions**:
- `status` (string): Invoice status - values: "draft", "open", "paid", "void", "uncollectible"

---

### 8. Get Payments

Get list of tenant payments with pagination.

- **URL**: `/api/billing/payments/`
- **Method**: `GET`
- **Authentication**: Required

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `page_size` (integer, optional): Items per page (default: 10)

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": [
    {
      "id": 1,
      "amount": "79.00",
      "currency": "USD",
      "payment_method": "card",
      "status": "succeeded",
      "failure_code": null,
      "failure_message": null,
      "processed_at": "2025-11-03T10:00:00Z",
      "created_at": "2025-11-03T10:00:00Z"
    }
  ],
  "count": 8,
  "next": "http://localhost:8000/api/billing/payments/?page=2",
  "previous": null
}
```

**Field Descriptions**:
- `status` (string): Payment status - values: "succeeded", "pending", "failed"
- `payment_method` (string): Payment method - values: "card", "bank_transfer", "other"


---

### 9. Create Setup Intent

Create Stripe setup intent for saving payment method. This saves the card for future recurring charges.

- **URL**: `/api/billing/setup-intent/`
- **Method**: `POST`
- **Authentication**: Required

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Setup intent created successfully",
  "data": {
    "client_secret": "seti_1234567890_secret_abcdefghijklmnop",
    "customer_id": "cus_1234567890"
  }
}
```

**Error Responses**:

*400 Bad Request - Stripe not configured*:
```json
{
  "success": false,
  "message": "Stripe payment processing is not enabled. Please configure STRIPE_SECRET_KEY in your .env file."
}
```

**Usage Flow**:
1. Call this endpoint to get `client_secret`
2. Use Stripe.js on frontend to collect payment method with the `client_secret`
3. Stripe.js returns a `payment_method_id`
4. Call "Add Payment Method" endpoint with the `payment_method_id`

---

### 10. Add Payment Method

Add payment method to customer account.

- **URL**: `/api/billing/payment-method/add/`
- **Method**: `POST`
- **Authentication**: Required
- **Permissions**: Owner, Admin

**Request Body**:
```json
{
  "payment_method_id": "pm_1234567890",
  "set_as_default": true
}
```

**Field Descriptions**:
- `payment_method_id` (string, required): Stripe payment method ID (from Stripe.js)
- `set_as_default` (boolean, optional): Set as default payment method (default: false)

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Payment method added successfully"
}
```

**Error Responses**:

*404 Not Found - No subscription*:
```json
{
  "success": false,
  "message": "No subscription found"
}
```


---

## Core Endpoints

### 1. Health Check

Health check endpoint for monitoring backend availability.

- **URL**: `/api/`
- **Method**: `GET`
- **Authentication**: Not Required

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "cache": "connected",
    "version": "1.0.0"
  }
}
```

**Error Response (503)**:
```json
{
  "success": false,
  "message": "Health check failed",
  "details": {
    "error": "Database connection failed"
  }
}
```

**Field Descriptions**:
- `status` (string): Overall health status - values: "healthy", "unhealthy"
- `database` (string): Database connection status - values: "connected", "disconnected"
- `cache` (string): Cache connection status - values: "connected", "disconnected"
- `version` (string): API version


---

## Data Models

### User Model

```typescript
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;  // Read-only: "{first_name} {last_name}"
  phone: string | null;
  avatar_url: string | null;
  role: "owner" | "admin" | "employee";
  employee_id: string;  // Auto-generated
  department: string | null;
  job_title: string | null;
  is_active: boolean;
  is_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;  // ISO 8601 datetime
  last_login_at: string | null;  // ISO 8601 datetime
}
```

### User Profile Model

```typescript
interface UserProfile {
  user: User;
  date_of_birth: string | null;  // YYYY-MM-DD
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  hire_date: string | null;  // YYYY-MM-DD
  skills: string[];
  certifications: string[];
  timezone: string;  // e.g., "America/New_York"
  language: string;  // e.g., "en"
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
}
```

### Tenant Model

```typescript
interface Tenant {
  id: number;
  name: string;
  slug: string;  // Auto-generated from name
  company_email: string;
  company_phone: string | null;
  website: string | null;
  company_size: "1-10" | "11-50" | "51-200" | "201-500" | "501+" | null;
  industry: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  is_active: boolean;
  trial_ends_at: string | null;  // ISO 8601 datetime
  is_trial_active: boolean;  // Read-only
  onboarding_completed: boolean;
  onboarding_step: number;  // 1-5
  member_count: number;  // Read-only
  created_at: string;  // ISO 8601 datetime
  updated_at: string;  // ISO 8601 datetime
}
```

### Tenant Member Model

```typescript
interface TenantMember {
  id: number;
  tenant: number;  // Tenant ID
  user: User;
  role: "owner" | "admin" | "employee";
  is_active: boolean;
  joined_at: string;  // ISO 8601 datetime
}
```


### Subscription Plan Model

```typescript
interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_monthly: string;  // Decimal as string, e.g., "79.00"
  price_yearly: string;  // Decimal as string, e.g., "790.00"
  yearly_discount_percentage: number;  // Read-only, calculated
  max_users: number | null;  // null = unlimited
  max_equipment: number | null;  // null = unlimited
  max_storage_gb: number;
  max_api_calls_per_month: number | null;  // null = unlimited
  features: string[];
  is_active: boolean;
}
```

### Subscription Model

```typescript
interface Subscription {
  id: number;
  plan: SubscriptionPlan;
  status: "active" | "past_due" | "canceled" | "incomplete";
  billing_cycle: "monthly" | "yearly";
  current_period_start: string;  // ISO 8601 datetime
  current_period_end: string;  // ISO 8601 datetime
  cancel_at_period_end: boolean;
  canceled_at: string | null;  // ISO 8601 datetime
  trial_start: string | null;  // ISO 8601 datetime
  trial_end: string | null;  // ISO 8601 datetime
  is_active: boolean;  // Read-only
  is_trial: boolean;  // Read-only
  days_until_renewal: number;  // Read-only
  current_users_count: number;
  current_equipment_count: number;
  current_storage_gb: string;  // Decimal as string
  usage_limits_exceeded: string[];  // e.g., ["users", "equipment"]
  created_at: string;  // ISO 8601 datetime
}
```

### Invoice Model

```typescript
interface Invoice {
  id: number;
  invoice_number: string;
  subtotal: string;  // Decimal as string
  tax: string;  // Decimal as string
  total: string;  // Decimal as string
  currency: string;  // e.g., "USD"
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  issue_date: string;  // YYYY-MM-DD
  due_date: string;  // YYYY-MM-DD
  paid_at: string | null;  // ISO 8601 datetime
  invoice_pdf_url: string | null;
  period_start: string;  // YYYY-MM-DD
  period_end: string;  // YYYY-MM-DD
  created_at: string;  // ISO 8601 datetime
}
```

### Payment Model

```typescript
interface Payment {
  id: number;
  amount: string;  // Decimal as string
  currency: string;  // e.g., "USD"
  payment_method: "card" | "bank_transfer" | "other";
  status: "succeeded" | "pending" | "failed";
  failure_code: string | null;
  failure_message: string | null;
  processed_at: string | null;  // ISO 8601 datetime
  created_at: string;  // ISO 8601 datetime
}
```

### Invitation Model

```typescript
interface Invitation {
  id: string;  // UUID
  email: string;
  role: "owner" | "admin" | "employee";
  invited_by: string | null;  // Email of inviter
  tenant_name?: string;  // Only in check invitation response
  created_at: string;  // ISO 8601 datetime
  expires_at: string;  // ISO 8601 datetime
  is_valid: boolean;  // Read-only
}
```


---

## Error Handling

### Standard Error Response

All errors follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field_name": ["Error message for this field"]
  }
}
```

### HTTP Status Codes

| Status Code | Meaning | When Used |
|------------|---------|-----------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Common Error Codes

| Error Code | Description |
|-----------|-------------|
| `EMAIL_NOT_VERIFIED` | User email not verified, cannot login |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `TOKEN_EXPIRED` | JWT token has expired |
| `TOKEN_INVALID` | JWT token is invalid |
| `PERMISSION_DENIED` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `VALIDATION_ERROR` | Input validation failed |

### Validation Errors (400)

Validation errors include field-specific error messages:

```json
{
  "success": false,
  "message": "Invalid registration data",
  "details": {
    "email": ["A user with this email already exists."],
    "password": [
      "This password is too common.",
      "Password must contain at least one uppercase letter."
    ],
    "phone": ["Enter a valid phone number."]
  }
}
```

### Authentication Errors (401)

**Invalid Credentials**:
```json
{
  "success": false,
  "message": "Invalid login credentials",
  "details": {
    "non_field_errors": ["Invalid email or password."]
  }
}
```

**Email Not Verified**:
```json
{
  "success": false,
  "message": "Please verify your email before logging in.",
  "code": "EMAIL_NOT_VERIFIED"
}
```

**Token Expired**:
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

**Missing Authentication**:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Permission Errors (403)

```json
{
  "success": false,
  "message": "Only owners and admins can update company information"
}
```

### Not Found Errors (404)

```json
{
  "success": false,
  "message": "No company found"
}
```

### Server Errors (500)

```json
{
  "success": false,
  "message": "Failed to create subscription: Database connection error"
}
```


---

## Common Integration Patterns

### 1. User Registration and Login Flow

```javascript
// Step 1: Register user
const registerResponse = await fetch('http://localhost:8000/api/auth/register/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    password_confirm: 'SecurePass123!',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1234567890',
    role: 'employee'
  })
});

// Step 2: Verify email with OTP
const verifyResponse = await fetch('http://localhost:8000/api/auth/verify-email/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    otp_code: '123456'
  })
});

// Step 3: Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

const { data } = await loginResponse.json();
const { access, refresh } = data.tokens;

// Store tokens
localStorage.setItem('access_token', access);
localStorage.setItem('refresh_token', refresh);
```

### 2. Making Authenticated Requests

```javascript
// Get access token from storage
const accessToken = localStorage.getItem('access_token');

// Make authenticated request
const response = await fetch('http://localhost:8000/api/auth/me/', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  }
});

if (response.status === 401) {
  // Token expired, refresh it
  await refreshAccessToken();
  // Retry the request
}
```

### 3. Token Refresh Flow

```javascript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  const response = await fetch('http://localhost:8000/api/auth/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
    return data.access;
  } else {
    // Refresh token expired, redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
}
```

### 4. Company Onboarding Flow

```javascript
// Step 1: Create company
const createTenantResponse = await fetch('http://localhost:8000/api/tenants/create/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    name: 'Acme Corporation',
    company_email: 'contact@acme.com',
    company_phone: '+1234567890',
    company_size: '11-50',
    industry: 'Manufacturing',
    city: 'New York',
    state: 'NY',
    country: 'USA'
  })
});

// Step 2: Complete onboarding steps
for (let step = 1; step <= 5; step++) {
  await fetch('http://localhost:8000/api/tenants/onboarding/step/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ step })
  });
}
```

### 5. Subscription Creation with Stripe

```javascript
// Step 1: Create setup intent
const setupIntentResponse = await fetch('http://localhost:8000/api/billing/setup-intent/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  }
});

const { data: { client_secret } } = await setupIntentResponse.json();

// Step 2: Use Stripe.js to collect payment method
const stripe = Stripe('pk_test_...');
const { setupIntent, error } = await stripe.confirmCardSetup(client_secret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'John Doe' }
  }
});

if (error) {
  console.error(error);
  return;
}

const paymentMethodId = setupIntent.payment_method;

// Step 3: Create subscription with payment method
const subscriptionResponse = await fetch('http://localhost:8000/api/billing/subscription/create/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    plan_slug: 'professional',
    billing_cycle: 'monthly',
    payment_method_id: paymentMethodId
  })
});
```

### 6. Error Handling Pattern

```javascript
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle error response
      if (response.status === 401) {
        // Try to refresh token
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry with new token
          options.headers.Authorization = `Bearer ${newToken}`;
          return apiRequest(url, options);
        }
      }
      
      // Throw error with details
      throw {
        status: response.status,
        message: data.message,
        details: data.details,
        code: data.code
      };
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage
try {
  const result = await apiRequest('http://localhost:8000/api/auth/me/', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  console.log(result.data);
} catch (error) {
  if (error.status === 400) {
    // Show validation errors
    Object.entries(error.details).forEach(([field, messages]) => {
      console.error(`${field}: ${messages.join(', ')}`);
    });
  } else {
    // Show general error
    console.error(error.message);
  }
}
```

---

## Additional Notes

### Date and Time Formats

- **ISO 8601 DateTime**: `2025-11-03T10:00:00Z` (used for timestamps)
- **Date Only**: `2025-11-03` (used for dates like issue_date, due_date)

### Decimal Values

Decimal values (prices, amounts) are returned as strings to preserve precision:
```json
{
  "price_monthly": "79.00",
  "total": "86.90"
}
```

### Null vs Undefined

- `null` indicates a field has no value
- Missing fields are not included in the response

### Boolean Flags

- `true` / `false` (lowercase)
- Never use `1` / `0` or `"true"` / `"false"` strings

### Arrays

Empty arrays are returned as `[]`, not `null`

### Stripe Integration

- Stripe integration is optional (controlled by `STRIPE_ENABLED` flag)
- If Stripe is not configured, subscription creation still works but payment method linking is skipped
- Setup intent endpoint returns 400 error if Stripe is not enabled

### Multi-Tenancy

- Users can belong to multiple tenants
- Current tenant is determined by active membership
- All data operations are scoped to the current tenant

### Trial Period

- 14-day trial starts automatically on tenant creation
- Trial status is indicated by `is_trial_active` field
- Subscriptions can be created during or after trial

---

**End of API Reference**

For questions or issues, please contact the backend team.
