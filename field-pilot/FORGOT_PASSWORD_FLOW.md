# Forgot Password Flow - Frontend Implementation Guide

## Overview
The forgot password feature uses a **3-step OTP-based verification flow** to securely reset user passwords.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FORGOT PASSWORD FLOW                          │
└─────────────────────────────────────────────────────────────────┘

Step 1: Request OTP
┌──────────────┐
│   User       │
│  Enters      │──────► POST /api/auth/forgot-password/
│   Email      │        { "email": "user@example.com" }
└──────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │  Backend      │
                        │  Generates    │
                        │  6-digit OTP  │
                        └───────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │  Email Sent   │
                        │  with OTP     │
                        └───────────────┘

Step 2: Verify OTP
┌──────────────┐
│   User       │
│  Enters      │──────► POST /api/auth/verify-reset-otp/
│   OTP Code   │        { "email": "user@example.com", "otp": "123456" }
└──────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │  Backend      │
                        │  Validates    │
                        │  OTP          │
                        └───────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │  Returns      │
                        │  reset_token  │
                        │  (15 min exp) │
                        └───────────────┘

Step 3: Reset Password
┌──────────────┐
│   User       │
│  Enters New  │──────► POST /api/auth/reset-password/
│  Password    │        { "email": "...", "reset_token": "...", 
└──────────────┘          "new_password": "...", "new_password_confirm": "..." }
                                │
                                ▼
                        ┌───────────────┐
                        │  Backend      │
                        │  Updates      │
                        │  Password     │
                        └───────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │  Success!     │
                        │  User can     │
                        │  login        │
                        └───────────────┘
```

---

## API Endpoints

### Base URL
```
http://localhost:8000/api/auth/
```

---

## Step 1: Request Password Reset OTP

### Endpoint
```
POST /api/auth/forgot-password/
```

### Request Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "email": "user@example.com"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "If the email exists, a password reset code has been sent.",
  "data": null
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid email",
  "errors": {
    "email": ["This field is required."]
  }
}
```

### Frontend Implementation
```javascript
// Step 1: Request OTP
async function requestPasswordReset(email) {
  try {
    const response = await fetch('http://localhost:8000/api/auth/forgot-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (data.success) {
      // Show success message
      alert('Password reset code sent to your email');
      // Navigate to OTP verification page
      navigateToOTPPage(email);
    } else {
      // Show error message
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to send reset code. Please try again.');
  }
}
```

---

## Step 2: Verify OTP Code

### Endpoint
```
POST /api/auth/verify-reset-otp/
```

### Request Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "OTP verified successfully. Use the reset token to set your new password.",
  "data": {
    "email": "user@example.com",
    "reset_token": "abc123xyz789...",
    "expires_in": "15 minutes"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid OTP",
  "errors": {
    "otp": ["Invalid or expired OTP code"]
  }
}
```

### Frontend Implementation
```javascript
// Step 2: Verify OTP
async function verifyResetOTP(email, otp) {
  try {
    const response = await fetch('http://localhost:8000/api/auth/verify-reset-otp/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (data.success) {
      // Store reset_token temporarily (in state or sessionStorage)
      const resetToken = data.data.reset_token;
      sessionStorage.setItem('reset_token', resetToken);
      sessionStorage.setItem('reset_email', email);
      
      // Navigate to new password page
      navigateToNewPasswordPage();
    } else {
      // Show error message
      alert(data.message || 'Invalid OTP code');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to verify OTP. Please try again.');
  }
}
```

---

## Step 3: Set New Password

### Endpoint
```
POST /api/auth/reset-password/
```

### Request Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "email": "user@example.com",
  "reset_token": "abc123xyz789...",
  "new_password": "NewSecurePass123!",
  "new_password_confirm": "NewSecurePass123!"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password.",
  "data": null
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid reset data",
  "errors": {
    "reset_token": ["Invalid or expired reset token"],
    "new_password": ["Password must be at least 8 characters"],
    "new_password_confirm": ["Passwords do not match"]
  }
}
```

### Frontend Implementation
```javascript
// Step 3: Reset Password
async function resetPassword(email, resetToken, newPassword, confirmPassword) {
  try {
    const response = await fetch('http://localhost:8000/api/auth/reset-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reset_token: resetToken,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Clear stored tokens
      sessionStorage.removeItem('reset_token');
      sessionStorage.removeItem('reset_email');
      
      // Show success message
      alert('Password reset successful! You can now login.');
      
      // Navigate to login page
      navigateToLoginPage();
    } else {
      // Show error message
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to reset password. Please try again.');
  }
}
```

---

## Bonus: Resend OTP

If the user doesn't receive the OTP or it expires, they can request a new one.

### Endpoint
```
POST /api/auth/resend-otp/
```

### Request Body
```json
{
  "email": "user@example.com",
  "purpose": "password_reset"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "OTP sent successfully. Please check your email.",
  "data": null
}
```

### Frontend Implementation
```javascript
// Resend OTP
async function resendOTP(email) {
  try {
    const response = await fetch('http://localhost:8000/api/auth/resend-otp/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        purpose: 'password_reset',
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert('New OTP sent to your email');
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to resend OTP. Please try again.');
  }
}
```

---

## Complete React Example

```jsx
import React, { useState } from 'react';

// Step 1: Request OTP Page
function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Reset code sent to your email!');
        // Navigate to OTP page with email
        window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`;
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>
    </div>
  );
}

// Step 2: Verify OTP Page
function VerifyOTPPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const email = new URLSearchParams(window.location.search).get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/verify-reset-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        // Store reset token
        sessionStorage.setItem('reset_token', data.data.reset_token);
        sessionStorage.setItem('reset_email', email);
        
        // Navigate to new password page
        window.location.href = '/reset-password';
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (error) {
      alert('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/resend-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'password_reset' }),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('Failed to resend OTP');
    }
  };

  return (
    <div>
      <h2>Enter Verification Code</h2>
      <p>We sent a code to {email}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>
      <button onClick={handleResendOTP}>Resend Code</button>
    </div>
  );
}

// Step 3: Reset Password Page
function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    const email = sessionStorage.getItem('reset_email');
    const resetToken = sessionStorage.getItem('reset_token');

    try {
      const response = await fetch('http://localhost:8000/api/auth/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          reset_token: resetToken,
          new_password: newPassword,
          new_password_confirm: confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear session storage
        sessionStorage.removeItem('reset_token');
        sessionStorage.removeItem('reset_email');
        
        alert('Password reset successful!');
        window.location.href = '/login';
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Set New Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export { ForgotPasswordPage, VerifyOTPPage, ResetPasswordPage };
```

---

## Important Notes

### Security Features
1. **OTP Expiry**: OTP codes expire after 10 minutes
2. **Reset Token Expiry**: Reset tokens expire after 15 minutes
3. **Email Privacy**: The API doesn't reveal if an email exists in the system
4. **One-time Use**: Reset tokens are cleared after successful password reset

### Password Requirements
- Minimum 8 characters
- Should include uppercase, lowercase, numbers, and special characters (recommended)

### Error Handling
Always handle these scenarios:
- Network errors
- Invalid OTP
- Expired OTP/token
- Password validation errors
- Email not found (though API won't explicitly say this)

### User Experience Tips
1. Show a countdown timer for OTP expiry (10 minutes)
2. Add a "Resend OTP" button with cooldown (e.g., 60 seconds)
3. Show password strength indicator
4. Display clear error messages
5. Add loading states for all API calls

---

## Testing

### Test Credentials
Use MailHog to view sent emails during development:
- URL: http://localhost:8025
- All emails are captured here instead of being sent

### Test Flow
1. Enter email on forgot password page
2. Check MailHog for OTP code
3. Enter OTP on verification page
4. Set new password
5. Login with new password

---

## Troubleshooting

### OTP Not Received
- Check MailHog at http://localhost:8025
- Verify email exists in database
- Check backend logs for email sending errors

### Invalid OTP Error
- OTP may have expired (10 minutes)
- Use "Resend OTP" feature
- Check for typos in OTP entry

### Invalid Reset Token
- Token may have expired (15 minutes)
- Start the flow again from Step 1
- Don't refresh the page after getting the token

---

## API Response Format

All endpoints follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": ["Error detail"]
  }
}
```
