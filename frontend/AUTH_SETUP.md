# Authentication Setup

This document describes the authentication implementation for the SuaVitrine frontend.

## Overview

The authentication system uses JWT tokens and integrates with the backend API at `/api/v1/auth`.

## Features

- ✅ Login and Registration forms in a single page
- ✅ Form validation with client-side checks
- ✅ Beautiful UI using shadcn/ui components
- ✅ Loading states and error handling
- ✅ JWT token storage in localStorage
- ✅ TanStack Query for API calls
- ✅ TypeScript type safety matching backend DTOs

## File Structure

```
src/
├── components/ui/
│   ├── card.tsx          # Card component for auth forms
│   ├── button.tsx        # Button component
│   ├── input.tsx         # Input component
│   └── label.tsx         # Label component
├── lib/
│   └── api/
│       ├── types.ts      # TypeScript types matching backend DTOs
│       └── auth.ts       # Auth API functions and storage helpers
├── hooks/
│   └── useAuth.ts        # Auth state management hook
└── routes/
    └── (auth)/
        └── login.tsx     # Login/Register page
```

## API Endpoints

### Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "token": "eyJhbGc...",
    "email": "user@example.com",
    "name": "John Doe"
  }
  ```

### Register
- **Endpoint:** `POST /api/v1/auth/register`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "token": "eyJhbGc...",
    "email": "user@example.com",
    "name": "John Doe"
  }
  ```

## Environment Variables

Create a `.env` file in the root of the frontend project:

```env
VITE_API_URL=http://localhost:8080
```

## Usage

### Accessing the Login Page

Navigate to `/login` in your application. The page displays:
- Login form by default
- Toggle to switch between Login and Register
- Form validation
- Loading states during API calls
- Error messages for failed requests

### Using Authentication in Components

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

To protect routes, you can add authentication checks in the route configuration:

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { authStorage } from '@/lib/api/auth';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const token = authStorage.getToken();
    if (!token) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/dashboard',
        },
      });
    }
  },
  component: DashboardComponent,
});
```

### Making Authenticated API Calls

Add the token to your API requests:

```tsx
import { authStorage } from '@/lib/api/auth';

async function fetchProtectedData() {
  const token = authStorage.getToken();
  
  const response = await fetch(`${API_BASE_URL}/api/v1/protected`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
}
```

## Form Validation

### Client-Side Validation
- Email format validation (HTML5)
- Password minimum length (6 characters)
- Required field validation

### Server-Side Validation
The backend validates:
- Email format and uniqueness
- Password requirements
- Required fields

Errors from the server are displayed in the form.

## Security Considerations

1. **Token Storage:** JWT tokens are stored in localStorage. For production, consider using httpOnly cookies.
2. **HTTPS:** Always use HTTPS in production to protect credentials in transit.
3. **Token Expiration:** Implement token refresh logic if your backend supports it.
4. **CORS:** Ensure your backend properly configures CORS for your frontend domain.

## Styling

The authentication pages use:
- shadcn/ui components for consistent styling
- Tailwind CSS for utility classes
- Lucide React for icons
- Responsive design that works on all screen sizes

## Testing the Implementation

1. Start the backend server (Spring Boot)
2. Start the frontend dev server:
   ```bash
   npm run dev
   ```
3. Navigate to `http://localhost:3000/login`
4. Try registering a new account
5. Try logging in with the created account
6. Check the browser's localStorage to see the stored token

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure your backend Spring Boot application has CORS properly configured:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### API Connection Failed
- Check that `VITE_API_URL` in `.env` points to your backend
- Verify the backend is running
- Check the browser console for detailed error messages

### Token Not Persisting
- Check browser's localStorage in DevTools
- Ensure no browser extensions are blocking localStorage
- Clear browser cache and try again

