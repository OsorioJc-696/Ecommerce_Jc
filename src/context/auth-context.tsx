'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: number;
  username: string;
  email: string;
  dni: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  address: string | null;
  photoUrl: string | null;
  favoriteProductIds: string[];
  isAdmin: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  addFavorite: (productId: number) => void;
  removeFavorite: (productId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      toast({ title: 'Welcome', description: `Hello, ${data.user.username}` });
      await fetchUser();

      router.push(data.user.isAdmin ? '/admin' : '/');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: err.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast, fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setCurrentUser(null);
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      toast({ title: 'Logged out' });
      router.push('/login');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Logout Error' });
    }
  }, [router, toast]);

  const updateUser = useCallback(async (updatedData: Partial<User>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar el perfil');

      setCurrentUser(data.user);
      return data.user;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: (err as Error).message || 'Error inesperado.',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addFavorite = async (productId: number) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Error al agregar favorito');

      toast({ title: 'Favorito agregado' });

      // ✅ Actualizar localmente el estado
      setCurrentUser(prev => prev && {
        ...prev,
        favoriteProductIds: [...(prev.favoriteProductIds || []), productId.toString()],
      });

    } catch (error) {
      console.error('Error al agregar favorito:', error);
      toast({
        variant: 'destructive',
        title: 'Error al agregar favorito',
        description: (error as Error).message || 'Algo salió mal',
      });
      throw error;
    }
  };

  const removeFavorite = async (productId: number) => {
    if (!currentUser) return;

    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) throw new Error('Error al quitar favorito');

      toast({ title: 'Favorito eliminado' });

      setCurrentUser(prev => prev && {
        ...prev,
        favoriteProductIds: (prev.favoriteProductIds || []).filter(id => id !== productId.toString()),
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error al quitar favorito',
        description: (err as Error).message || 'Algo salió mal',
      });
    }
  };

  const value: AuthContextType = {
    currentUser,
    login,
    logout,
    updateUser,
    isLoading,
    isAdmin: !!currentUser?.isAdmin,
    addFavorite,
    removeFavorite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
