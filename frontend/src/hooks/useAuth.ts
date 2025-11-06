import { useEffect, useState } from 'react';
import { authStorage } from '@/lib/api/auth';

export interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = authStorage.getToken();
    const storedUser = authStorage.getUser();

    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  const logout = () => {
    authStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    userId: user?.id,
    isAuthenticated,
    isLoading,
    logout,
  };
}

