# Authentication Setup Guide

## Overview
The authentication flow includes Sign In and Sign Up pages that connect to the KundaGo backend API.

## File Structure
```
app/
├── index.tsx                 # Home/Landing page with Sign In/Sign Up buttons
├── auth/
│   ├── _layout.tsx          # Auth stack navigator
│   ├── sign-in.tsx          # Sign In page
│   └── sign-up.tsx          # Sign Up page
```

## Pages

### Landing Page (`app/index.tsx`)
- Welcome screen with Sign In and Sign Up button options
- Routes to `/auth/sign-in` and `/auth/sign-up`

### Sign In Page (`app/auth/sign-in.tsx`)
**Required Fields:**
- Email (lowercase, validated)
- Password (minimum 6 characters)

**Features:**
- Form validation with error messages
- Loading state during submission
- Link to Sign Up page
- Forgot password link (placeholder)
- Uses design system colors and typography

**Backend Endpoint:**
```
POST /auth/login
Body: { email, password }
Response: { success, message, data: { user, token } }
```

### Sign Up Page (`app/auth/sign-up.tsx`)
**Required Fields:**
- Full Name
- Email (lowercase, validated)
- Phone Number
- Password (minimum 6 characters)
- Confirm Password (must match)

**Features:**
- Complete form validation
- Password match verification
- Minimum length requirement (6 characters)
- Error messaging for each validation
- Link to Sign In page
- Uses design system colors and typography

**Backend Endpoint:**
```
POST /auth/register
Body: { fullName, phone, email, password }
Response: { success, message, data: { user, token } }
```

## Integration Steps

### 1. Setup Environment Variables
Create `.env.local` in the project root:
```env
EXPO_PUBLIC_API_URL=http://your-backend-url:3000
```

### 2. Create API Service
Create `src/services/auth.service.ts`:
```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.data.token) {
      await SecureStore.setItemAsync('authToken', response.data.data.token);
    }
    return response.data;
  },

  async register(fullName: string, phone: string, email: string, password: string) {
    const response = await api.post('/auth/register', {
      fullName,
      phone,
      email,
      password,
    });
    if (response.data.data.token) {
      await SecureStore.setItemAsync('authToken', response.data.data.token);
    }
    return response.data;
  },

  async logout() {
    await SecureStore.deleteItemAsync('authToken');
  },

  async getToken() {
    return await SecureStore.getItemAsync('authToken');
  },
};
```

### 3. Update Sign In Page
Uncomment the API call in `app/auth/sign-in.tsx`:
```typescript
const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: email.toLowerCase(), password }),
});
```

### 4. Update Sign Up Page
Uncomment the API call in `app/auth/sign-up.tsx`:
```typescript
const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName,
    phone,
    email: email.toLowerCase(),
    password,
  }),
});
```

### 5. Create Auth Context (Optional but Recommended)
For global auth state management, create `src/context/AuthContext.tsx`:
```typescript
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        setToken(token);
        // Fetch user profile using token
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Form Validation Rules

### Email Validation
- Required field
- Must be valid email format
- Checked for existing account on sign up

### Password Validation
- Minimum 6 characters
- Required field
- Must match confirmPassword on sign up

### Full Name Validation (Sign Up)
- Required field
- Cannot be empty/whitespace only

### Phone Validation (Sign Up)
- Required field
- Cannot be empty/whitespace only

## Error Handling

Common error responses:
- **400 Bad Request**: Missing required fields or validation failed
- **409 Conflict**: Email already registered
- **401 Unauthorized**: Invalid email or password
- **500 Server Error**: Server-side error

All errors are displayed in a red banner at the top of the form with the error message from the backend or a default message.

## Design System Integration

Both pages use the design system defined in `constants/theme.ts`:
- **Colors**: Primary green (#22c55e), surfaces, errors
- **Typography**: Display, body, and label text classes
- **Spacing**: 4px grid baseline (4px, 8px, 16px, 24px, 40px)
- **Border Radius**: 4px (sm) for input fields and buttons

## Security Considerations

1. **Token Storage**: Use `expo-secure-store` for storing auth tokens securely
2. **Sensitive Fields**: Never log passwords or tokens
3. **Email Format**: Always lowercase emails before sending to backend
4. **HTTPS**: Always use HTTPS for API calls in production
5. **Password Hashing**: Backend must hash passwords with bcrypt (already implemented in auth.controller.js)
6. **OTP-based Reset**: Forgot password flow uses OTP for verification (see auth.controller.js)

## Testing

Mock API responses are currently in place for development. To test with real backend:
1. Set `EXPO_PUBLIC_API_URL` environment variable
2. Uncomment API fetch calls in sign-in.tsx and sign-up.tsx
3. Install `expo-secure-store` for token storage: `npx expo install expo-secure-store`
4. Create AuthContext for state management
5. Add axios or fetch interceptors for token attachment

## Forgot Password Flow

The backend supports password reset via OTP:
1. User requests password reset with email
2. Backend sends OTP to email
3. User enters OTP to verify
4. System generates temporary reset token
5. User enters new password with reset token

To implement frontend forgot password:
- Create `app/auth/forgot-password.tsx` screen
- Create `app/auth/verify-otp.tsx` screen
- Create `app/auth/reset-password.tsx` screen
- Connect to `/auth/forgot-password`, `/auth/verify-otp`, `/auth/reset-password` endpoints

See backend endpoints in `auth.controller.js` for full implementation details.
