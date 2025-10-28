'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const token = response.token;
      
      // Decode JWT to get user info (simple decode, not verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userData: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name || 'User',
        role: payload.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setToken(token);
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    try {
      const response = await authApi.register(name, email, password, role);
      const token = response.token;
      
      // Decode JWT to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userData: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name || name,
        role: payload.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setToken(token);
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
