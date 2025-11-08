# Authentication API Reference

Complete documentation of all authentication endpoints with request/response formats, status codes, and error handling.

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
   - [Register](#1-register)
   - [Login](#2-login)
   - [Logout](#3-logout)
   - [Token Refresh](#4-token-refresh)
2. [Email Verification](#email-verification)
   - [Verify Email](#5-verify-email)
   - [Resend OTP](#6-resend-otp)
3. [Password Management](#password-management)
   - [Forgot Password](#7-forgot-password)
   - [Reset Password](#8-reset-password)
   - [Change Password](#9-change-password)
4. [User Profile](#user-profile)
   - [Get Current User](#10-get-current-user-me)
   - [Get Profile](#11-get-profile)
   - [Update Profile](#12-update-profile)

---

## Authentication Endpoints

### 1. Register

Register a new user account with email verification.

**Endpoint:** `POST /api/auth/register/`

**Permission:** Public (AllowAny)

**Note:** Only available from public schema (localhost:8000)

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "employee",
  "department": "Engineering",
  "job_title": "Software Engineer"
}
```

#### Success Response

**Status Code:** `201 Created`

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
      "department": "Engineering",
      "job_title": "Software Engineer",
      "is_active": true,
      "is_verified": false,
      "two_factor_enabled": false,
      "created_at": "2025-11-08T10:00:00Z",
      "last_login_at": null
    },
    "message": "Registration successful. Please check your email for verification code."
  }
}
```

#### Error Responses

**Status Code:** `400 Bad Request` - Invalid registration data

```json
{
  "success": false,
  "message": "Invalid registration data",
  "details": {
    "email": ["A user with this email already exists."],
    "password": ["This password is too common."],
    "password_confirm": ["Passwords don't match."]
  }
}
```

**Status Code:** `403 Forbidden` - Wrong schema access

```json
{
  "success": false,
  "message": "This endpoint is only available from the onboarding portal. Please access via http://localhost:8000"
}
```

**Status Code:** `500 Internal Server Error` - Server error

```json
{
  "success": false,
  "message": "Registration failed. Please try again."
}
```

---

### 2. Login

Authenticate user and return JWT access and refresh tokens.

**Endpoint:** `POST /api/auth/login/`

**Permission:** Public (AllowAny)

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": false
}
```

#### Success Response

**Status Code:** `200 OK`

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
      "created_at": "2025-11-08T10:00:00Z",
      "last_login_at": "2025-11-08T11:00:00Z"
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

#### Error Responses

**Status Code:** `401 Unauthorized` - Invalid credentials

```json
{
  "success": false,
  "message": "Invalid login credentials",
  "details": {
    "non_field_errors": ["Invalid email or password."]
  }
}
```

**Status Code:** `401 Unauthorized` - Email not verified

```json
{
  "success": false,
  "message": "Please verify your email before logging in.",
  "code": "EMAIL_NOT_VERIFIED"
}
```

**Status Code:** `401 Unauthorized` - Account disabled

```json
{
  "success": false,
  "message": "Invalid login credentials",
  "details": {
    "non_field_errors": ["User account is disabled."]
  }
}
```

**Status Code:** `500 Internal Server Error` - Server error

```json
{
  "success": false,
  "message": "Login failed. Please try again."
}
```

---

### 3. Logout

Logout user and blacklist refresh token.

**Endpoint:** `POST /api/auth/logout/`

**Permission:** Authenticated (IsAuthenticated)

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Request Body

```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Error Responses

**Status Code:** `400 Bad Request` - Invalid refresh token

```json
{
  "success": false,
  "message": "Logout failed"
}
```

**Status Code:** `401 Unauthorized` - Not authenticated

```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 4. Token Refresh

Get a new access token using a valid refresh token.

**Endpoint:** `POST /api/auth/token/refresh/`

**Permission:** Public (AllowAny)

#### Request Body

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Error Responses

**Status Code:** `401 Unauthorized` - Invalid or expired refresh token

```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

---

## Email Verification

### 5. Verify Email

Verify user email address with OTP code.

**Endpoint:** `POST /api/auth/verify-email/`

**Permission:** Public (AllowAny)

#### Request Body

```json
{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

#### Success Response

**Status Code:** `200 OK`

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
      "created_at": "2025-11-08T10:00:00Z",
      "last_login_at": null
    }
  }
}
```

#### Error Responses

**Status Code:** `400 Bad Request` - Invalid verification data

```json
{
  "success": false,
  "message": "Invalid verification data",
  "details": {
    "non_field_errors": ["Invalid or expired OTP code."]
  }
}
```

**Status Code:** `400 Bad Request` - Email already verified

```json
{
  "success": false,
  "message": "Invalid verification data",
  "details": {
    "non_field_errors": ["Email is already verified."]
  }
}
```

**Status Code:** `400 Bad Request` - Invalid email or OTP

```json
{
  "success": false,
  "message": "Invalid verification data",
  "details": {
    "non_field_errors": ["Invalid email or OTP code."]
  }
}
```

**Status Code:** `500 Internal Server Error` - Server error

```json
{
  "success": false,
  "message": "Email verification failed"
}
```

---

### 6. Resend OTP

Resend OTP code for email verification or password reset.

**Endpoint:** `POST /api/auth/resend-otp/`

**Permission:** Public (AllowAny)

#### Request Body

```json
{
  "email": "user@example.com",
  "purpose": "email_verification"
}
```

**Purpose Options:**
- `email_verification` - For email verification
- `password_reset` - For password reset

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "OTP sent successfully. Please check your email."
}
```

Or (for security, when email doesn't exist):

```json
{
  "success": true,
  "message": "If the email exists, OTP has been sent."
}
```

#### Error Responses

**Status Code:** `400 Bad Request` - Invalid request data

```json
{
  "success": false,
  "message": "Invalid request data",
  "details": {
    "email": ["This field is required."],
    "purpose": ["This field is required."]
  }
}
```

**Status Code:** `400 Bad Request` - Email already verified

```json
{
  "success": false,
  "message": "Invalid request data",
  "details": {
    "non_field_errors": ["Email is already verified."]
  }
}
```

**Status Code:** `500 Internal Server Error` - Failed to send OTP

```json
{
  "success": false,
  "message": "Failed to send OTP. Please try again."
}
```

**Status Code:** `500 Internal Server Error` - Server error

```json
{
  "success": false,
  "message": "Failed to resend OTP"
}
```

---

## Password Management

### 7. Forgot Password

Request password reset OTP to be sent to email.

**Endpoint:** `POST /api/auth/forgot-password/`

**Permission:** Public (AllowAny)

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "If the email exists, a password reset code has been sent."
}
```

**Note:** For security reasons, the response is the same whether the email exists or not.

#### Error Responses

**Status Code:** `400 Bad Request` - Invalid email

```json
{
  "success": false,
  "message": "Invalid email",
  "details": {
    "email": ["Enter a valid email address."]
  }
}
```

**Status Code:** `500 Internal Server Error` - Server error

```json
{
  "success": false,
  "message": "Failed to process password reset request"
}
```

---

### 8. Reset Password

Reset password using OTP verification.

**Endpoint:** `POST /api/auth/reset-password/`

**Permission:** Public (AllowAny)

#### Request Body

```json
{
  "email": "user@example.com",
  "otp_code": "123456",
  "new_password": "NewSecurePass123!",
  "new_password_confirm": "NewSecurePass123!"
}
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

#### Error Responses

**Status Code:** `400 Bad Request` - Invalid reset data

```json
{
  "success": false,
  "message": "Invalid reset data",
  "details": {
    "non_field_errors": ["Passwords don't match."]
  }
}
```

**Status Code:** `400 Bad Request` - Invalid or expired OTP

```json
{
  "success": false,
  "message": "Invalid reset data",
  "details": {
    "non_field_errors": ["Invalid or expired OTP code."]
  }
}
```

**Status Code:** `400 Bad Request` - Invalid email or OTP

```json
{
  "success": false,
  "message": "Invalid reset data",
  "details": {
    "non_field_errors": ["Invalid email or OTP code."]
  }
}
```

**Status Code:** `400 Bad Request` - Weak password

```json
{
  "success": false,
  "message": "Invalid reset data",
  "details": {
    "new_password": [
      "This password is too short. It must contain at least 8 characters.",
      "This password is too common.",
      "This password is entirely numeric."
    ]
  }
}
```

**Status Code:** `500 Internal Server Error` - Server error

```json
{
  "success": false,
  "message": "Password reset failed"
}
```

---

### 9. Change Password

Change password for authenticated user.

**Endpoint:** `POST /api/auth/change-password/`

**Permission:** Authenticated (IsAuthenticated)

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Request Body

```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePass123!",
  "new_password_confirm": "NewSecurePass123!"
}
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Error Responses

**Status Code:** `400 Bad Request` - Invalid password data

```json
{
  "success": false,
  "message": "Invalid password data",
  "details": {
    "non_field_errors": ["Current password is incorrect."]
  }
}
```

**Status Code:** `400 Bad Request` - Passwords don't match

```json
{
  "success": false,
  "message": "Invalid password data",
  "details": {
    "non_field_errors": ["New passwords don't match."]
  }
}
```

**Status Code:** `400 Bad Request` - Weak password

```json
{
  "success": false,
  "message": "Invalid password data",
  "details": {
    "new_password": [
      "This password is too short. It must contain at least 8 characters.",
      "This password is too common."
    ]
  }
}
```

**Status Code:** `401 Unauthorized` - Not authenticated

```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Status Code:** `500 Internal Server Error` - Server error

```json
{
  "success": false,
  "message": "Password change failed"
}
```

---

## User Profile

### 10. Get Current User (Me)

Retrieve information about the currently authenticated user.

**Endpoint:** `GET /api/auth/me/`

**Permission:** Authenticated (IsAuthenticated)

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Success Response

**Status Code:** `200 OK`

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
    "created_at": "2025-11-08T10:00:00Z",
    "last_login_at": "2025-11-08T11:00:00Z"
  }
}
```

#### Error Responses

**Status Code:** `401 Unauthorized` - Not authenticated

```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Status Code:** `500 Internal Server Error` - Server error

```json
{
  "success": false,
  "message": "Failed to retrieve user information"
}
```

---

### 11. Get Profile

Get detailed user profile information.

**Endpoint:** `GET /api/auth/profile/`

**Permission:** Authenticated (IsAuthenticated)

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Success Response

**Status Code:** `200 OK`

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
      "created_at": "2025-11-08T10:00:00Z",
      "last_login_at": "2025-11-08T11:00:00Z"
    },
    "date_of_birth": "1990-01-15",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip_code": "94102",
    "country": "USA",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+1234567891",
    "emergency_contact_relationship": "Spouse",
    "hire_date": "2023-01-01",
    "skills": ["Python", "Django", "React"],
    "certifications": ["AWS Certified"],
    "timezone": "America/Los_Angeles",
    "language": "en",
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true
  }
}
```

#### Error Responses

**Status Code:** `401 Unauthorized` - Not authenticated

```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Status Code:** `500 Internal Server Error` - Server error

```json
{
  "success": false,
  "message": "Failed to retrieve profile"
}
```

---

### 12. Update Profile

Update user profile information.

**Endpoint:** `PUT /api/auth/profile/update/`

**Permission:** Authenticated (IsAuthenticated)

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Request Body

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
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "country": "USA",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+1234567891",
  "emergency_contact_relationship": "Spouse",
  "skills": ["Python", "Django", "React", "AWS"],
  "certifications": ["AWS Certified", "Kubernetes Certified"],
  "timezone": "America/Los_Angeles",
  "language": "en",
  "email_notifications": true,
  "sms_notifications": true,
  "push_notifications": true
}
```

**Note:** All fields are optional. Only include fields you want to update.

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated successfully",
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
      "job_title": "Senior Software Engineer",
      "is_active": true,
      "is_verified": true,
      "two_factor_enabled": false,
      "created_at": "2025-11-08T10:00:00Z",
      "last_login_at": "2025-11-08T11:00:00Z"
    },
    "date_of_birth": "1990-01-15",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip_code": "94102",
    "country": "USA",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+1234567891",
    "emergency_contact_relationship": "Spouse",
    "hire_date": "2023-01-01",
    "skills": ["Python", "Django", "React", "AWS"],
    "certifications": ["AWS Certified", "Kubernetes Certified"],
    "timezone": "America/Los_Angeles",
    "language": "en",
    "email_notifications": true,
    "sms_notifications": true,
    "push_notifications": true
  }
}
```

#### Error Responses

**Status Code:** `400 Bad Request` - Invalid profile data

```json
{
  "success": false,
  "message": "Invalid profile data",
  "details": {
    "phone": ["Enter a valid phone number."],
    "avatar_url": ["Enter a valid URL."],
    "date_of_birth": ["Date has wrong format. Use one of these formats instead: YYYY-MM-DD."]
  }
}
```

**Status Code:** `401 Unauthorized` - Not authenticated

```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Status Code:** `500 Internal Server Error` - Server error

```json
{
  "success": false,
  "message": "Profile update failed"
}
```

---

## Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Authentication Header Format

For endpoints requiring authentication, include the JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Example:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjk5NDU2Nzg5LCJpYXQiOjE2OTk0NTU4ODksImp0aSI6IjEyMzQ1Njc4OTAiLCJ1c2VyX2lkIjoxfQ.abc123def456
```

---

## Error Response Format

All error responses follow this standard format:

```json
{
  "success": false,
  "message": "Error message description",
  "details": {
    "field_name": ["Error detail 1", "Error detail 2"]
  },
  "code": "ERROR_CODE"
}
```

- `success`: Always `false` for errors
- `message`: Human-readable error message
- `details`: (Optional) Field-specific validation errors
- `code`: (Optional) Machine-readable error code

---

## OTP Code Information

- OTP codes are 6-digit numeric codes
- OTP codes expire after 10 minutes
- OTP codes are sent via email
- Each OTP is purpose-specific (email verification or password reset)
- A new OTP invalidates the previous one

---

## Token Information

### Access Token
- Expires in 15 minutes (900 seconds)
- Used for authenticating API requests
- Include in Authorization header as Bearer token

### Refresh Token
- Longer expiration time
- Used to obtain new access tokens
- Should be stored securely
- Can be blacklisted on logout

---

## Security Notes

1. Always use HTTPS in production
2. Store tokens securely (never in localStorage for sensitive apps)
3. Implement rate limiting on authentication endpoints
4. Use strong passwords (validated by Django's password validators)
5. Email verification is required before login
6. Login attempts are logged for security monitoring
7. Passwords are hashed using Django's default hasher (PBKDF2)
8. OTP codes expire after 10 minutes
9. Refresh tokens can be blacklisted on logout

---

## Rate Limiting Recommendations

Consider implementing rate limiting on these endpoints:

- Login: 5 attempts per 15 minutes per IP
- Register: 3 attempts per hour per IP
- Forgot Password: 3 attempts per hour per email
- Resend OTP: 3 attempts per 10 minutes per email
- Verify Email: 5 attempts per 10 minutes per email

---

## Testing Tips

1. Use the `/api/schema/swagger/` endpoint to test APIs interactively
2. Register endpoint only works from localhost:8000 (public schema)
3. Verify email before attempting to login
4. Save the refresh token for token refresh testing
5. Include the access token in Authorization header for protected endpoints
6. Test error cases by providing invalid data

---

**Last Updated:** November 8, 2025  
**API Version:** 1.0  
**Base URL:** `http://localhost:8000/api/auth/` (Development)
