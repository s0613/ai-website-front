"use client";
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  email: string;
  token: string | null; // JWT (httpOnly 쿠키이므로 직접 읽지는 못하지만, 로컬 상태로 관리할 수 있음)
  login: (email: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // 이미 localStorage에 저장된 로그인 정보 복원
  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    const storedToken = localStorage.getItem('token');
    if (storedEmail && storedToken) {
      setEmail(storedEmail);
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // 앱 최초 마운트 시 /api/auth/me 호출하여 현재 로그인 상태 복원
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/auth/me', {
          credentials: 'include', // httpOnly 쿠키를 포함해 전송
        });
        if (res.ok) {
          const data = await res.json();
          if (data.email) {
            // token은 httpOnly 쿠키에 있으므로 여기서는 이메일만 업데이트
            login(data.email, "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = (email: string, token: string) => {
    setEmail(email);
    setToken(token);
    setIsLoggedIn(true);
    localStorage.setItem('email', email);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setEmail('');
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('email');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, email, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
