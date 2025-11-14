import { redirect } from '@tanstack/react-router';
import { authStorage } from './api/auth';

/**
 * Auth guard to protect routes
 * Use this in route's beforeLoad function
 * 
 * @example
 * export const Route = createFileRoute('/dashboard')({
 *   beforeLoad: authGuard,
 *   component: DashboardComponent,
 * });
 */
export function authGuard() {
  const token = authStorage.getToken();
  
  if (!token) {
    throw redirect({
      to: '/login',
    });
  }
}

/**
 * Redirect authenticated users away from auth pages
 * Use this in login/register routes
 * 
 * @example
 * export const Route = createFileRoute('/login')({
 *   beforeLoad: redirectIfAuthenticated,
 *   component: LoginComponent,
 * });
 */
export function redirectIfAuthenticated() {
  const token = authStorage.getToken();
  
  if (token) {
    throw redirect({
      to: '/',
    });
  }
}

