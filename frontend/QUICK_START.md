# 🚀 Quick Start - Authentication

## What was implemented

✅ **Complete authentication system** with login and registration
✅ **Beautiful UI** using shadcn/ui components
✅ **Backend integration** matching your Spring Boot API DTOs
✅ **Type-safe** API calls with TypeScript
✅ **TanStack Query** for state management
✅ **Auth guards** for protected routes
✅ **JWT token storage** in localStorage

## Files Created/Modified

### New Components
- `src/components/ui/card.tsx` - Card component for auth forms

### API Layer
- `src/lib/api/types.ts` - TypeScript types matching backend DTOs
- `src/lib/api/auth.ts` - Auth API functions and storage helpers

### Hooks
- `src/hooks/useAuth.ts` - Auth state management hook

### Routes
- `src/routes/(auth)/login.tsx` - Complete login/signup page (updated)
- `src/routes/index.tsx` - Home page with auth integration (updated)

### Utilities
- `src/lib/auth-guard.ts` - Route protection helpers

### Configuration
- `.env.example` - Environment variables template

### Documentation
- `AUTH_SETUP.md` - Complete authentication setup guide
- `QUICK_START.md` - This file

## 🎯 Quick Test

1. **Start your backend** (Spring Boot):
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Set up environment variables**:
   ```bash
   cd suavitrine
   # The .env file is already created with:
   # VITE_API_URL=http://localhost:8080
   ```

3. **Start the frontend**:
   ```bash
   npm run dev
   ```

4. **Test the flow**:
   - Navigate to http://localhost:3000
   - Click "Entrar" button
   - Create a new account using the registration form
   - You'll be redirected to home page showing your user info
   - Try logging out and logging in again

## 📁 Project Structure

```
suavitrine/
├── src/
│   ├── components/ui/
│   │   ├── button.tsx
│   │   ├── card.tsx           ← NEW
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── hooks/
│   │   └── useAuth.ts         ← NEW
│   ├── lib/
│   │   ├── api/
│   │   │   ├── auth.ts        ← NEW
│   │   │   └── types.ts       ← NEW
│   │   ├── auth-guard.ts      ← NEW
│   │   └── utils.ts
│   └── routes/
│       ├── (auth)/
│       │   └── login.tsx      ← UPDATED
│       └── index.tsx          ← UPDATED
├── .env                       ← NEW (gitignored)
├── .env.example              ← NEW
└── AUTH_SETUP.md             ← NEW (detailed guide)
```

## 🔐 API Endpoints Used

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

Both match your backend DTOs:
- `LoginRequest` → `{email, password}`
- `RegisterRequest` → `{name, email, password}`
- `AuthenticationResponse` → `{token, email, name}`

## 🎨 UI Features

- 📱 Responsive design
- 🌓 Dark mode ready (uses shadcn theme)
- ⚡ Loading states
- ❌ Error handling with user-friendly messages
- ✅ Form validation (client + server)
- 🔄 Smooth toggle between login/signup
- 🎯 Accessible components

## 🛡️ Protected Routes Example

To protect a route, add the auth guard:

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { authGuard } from '@/lib/auth-guard';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: authGuard,
  component: DashboardComponent,
});

function DashboardComponent() {
  return <div>Protected content</div>;
}
```

## 💡 Common Use Cases

### Check if user is logged in
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, user } = useAuth();
  
  return isAuthenticated ? (
    <p>Welcome, {user?.name}!</p>
  ) : (
    <p>Please log in</p>
  );
}
```

### Make authenticated API calls
```tsx
import { authStorage } from '@/lib/api/auth';

const token = authStorage.getToken();
const response = await fetch(`${API_URL}/api/v1/protected`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### Logout user
```tsx
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

## 🐛 Troubleshooting

### Backend not connecting?
- Check `.env` has correct `VITE_API_URL`
- Verify backend is running on port 8080
- Check browser console for CORS errors

### CORS issues?
Your backend needs to allow requests from `http://localhost:3000`:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

### Token not persisting?
- Check browser's localStorage in DevTools
- Look for keys: `auth_token` and `auth_user`

## 📚 Next Steps

1. Implement token refresh mechanism
2. Add "Forgot Password" functionality
3. Add email verification
4. Implement OAuth/Social login
5. Add user profile management

## 🎉 You're all set!

The authentication system is ready to use. Check `AUTH_SETUP.md` for more detailed documentation.

