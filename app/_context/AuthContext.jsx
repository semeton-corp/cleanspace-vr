"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { dbService } from '../../lib/database';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = Cookies.get('user');
    const savedSessionId = Cookies.get('sessionId');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedSessionId) {
          setSessionId(savedSessionId);
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        Cookies.remove('user');
        Cookies.remove('sessionId');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          nim: data.user.nim,
          fullName: data.user.fullName,
          email: data.user.email,
          fakultas: data.user.fakultas,
          programStudi: data.user.programStudi,
          loginTime: new Date().toISOString()
        };
        
        // Save to database
        const dbResult = await dbService.saveUserSession(userData);
        if (dbResult.success) {
          setSessionId(dbResult.data.id);
          Cookies.set('sessionId', dbResult.data.id, { expires: 1 });
        }
        
        setUser(userData);
        Cookies.set('user', JSON.stringify(userData), { expires: 1 }); // Expires in 1 day
        
        toast.success(`Selamat datang, ${data.user.fullName}!`);
        
        return { success: true };
      } else {
        toast.error(data.message || 'Login gagal');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Terjadi kesalahan saat login');
      return { success: false, message: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSessionId(null);
    Cookies.remove('user');
    Cookies.remove('sessionId');
    toast.success('Berhasil logout');
  };

  const value = {
    user,
    sessionId,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
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
