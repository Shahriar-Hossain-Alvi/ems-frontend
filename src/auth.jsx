import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { queryKeys } from './hooks/queryKeys';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const refresh = async () => {
    const token = localStorage.getItem('ems_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const currentUser = await queryClient.fetchQuery({
        queryKey: queryKeys.me,
        queryFn: authApi.me,
        staleTime: 0,
      });
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      localStorage.removeItem('ems_token');
      setUser(null);
      queryClient.removeQueries({ queryKey: queryKeys.me });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh().catch(() => {});
    const handleUnauthorized = () => {
      setUser(null);
      queryClient.clear();
    };
    window.addEventListener('ems:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ems:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const result = await authApi.login({ email, password });
    localStorage.setItem('ems_token', result.accessToken);
    queryClient.clear();
    const currentUser = await refresh();
    return currentUser;
  };

  const logout = () => {
    localStorage.removeItem('ems_token');
    setUser(null);
    queryClient.clear();
  };

  const value = useMemo(() => ({ user, loading, login, refresh, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
