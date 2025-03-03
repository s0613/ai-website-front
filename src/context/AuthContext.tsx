"use client";
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// ──────────────────────────────────────────────
// AuthContext (클라이언트 인증 컨텍스트)
// ──────────────────────────────────────────────

export interface AuthContextType {
  isLoggedIn: boolean;
  email: string;
  token: string | null;
  userRole: string;
  login: (email: string, token: string, role?: string) => void;
  logout: () => void;
}

const defaultContextValue: AuthContextType = {
  isLoggedIn: false,
  email: '',
  token: null,
  userRole: '',
  login: () => { },
  logout: () => { }
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('');

  // 로컬 스토리지에 저장된 로그인 정보 복원
  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');

    if (storedEmail && storedToken) {
      setEmail(storedEmail);
      setToken(storedToken);
      setIsLoggedIn(true);
      setUserRole(storedRole || '');
    }
  }, []);

  // 앱 최초 마운트 시 /api/auth/me 호출하여 로그인 상태 복원
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/auth/me', {
          credentials: 'include', // httpOnly 쿠키 포함
        });
        if (res.ok) {
          const data = await res.json();
          if (data.email) {
            // 서버에서 반환된 토큰도 함께 사용
            login(data.email, data.token || "temp-token-value", data.role);
          }
        }
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = (email: string, token: string, role: string = '') => {
    console.log('AuthContext login 호출됨, 역할:', role);

    // role이 대문자로 들어올 경우를 대비해 소문자로 변환
    const normalizedRole = role.trim().toLowerCase();
    console.log('정규화된 역할:', normalizedRole);

    setEmail(email);
    setToken(token);
    setIsLoggedIn(true);
    setUserRole(normalizedRole);

    localStorage.setItem('email', email);
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', normalizedRole);

    // 쿠키 설정 추가 - 쿠키 만료 시간 설정 (7일)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    document.cookie = `auth-token=${token}; path=/; expires=${expiryDate.toUTCString()}`;
    document.cookie = `userRole=${normalizedRole}; path=/; expires=${expiryDate.toUTCString()}`;

    console.log('쿠키 설정 완료:', document.cookie);
  };

  const logout = () => {
    setEmail('');
    setToken(null);
    setIsLoggedIn(false);
    setUserRole('');

    localStorage.removeItem('email');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');

    // 쿠키 삭제
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, email, token, userRole, login, logout }}>
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
