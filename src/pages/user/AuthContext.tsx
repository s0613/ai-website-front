// src/components/context/AuthContext.tsx
"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { getCurrentUser } from "./services/UserService"; // UserService import

export interface AuthContextType {
  isLoggedIn: boolean;
  email: string;
  token: string | null;
  userRole: string;
  nickname: string;
  login: (
    email: string,
    token: string,
    role?: string,
    nickname?: string
  ) => void;
  logout: () => void;
}

const defaultContextValue: AuthContextType = {
  isLoggedIn: false,
  email: "",
  token: null,
  userRole: "",
  nickname: "",
  login: () => { },
  logout: () => { },
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState("");
  const [nickname, setNickname] = useState("");

  // 쿠키에서 값을 읽는 유틸리티 함수
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift();
    }
    return "";
  };

  // 초기화: 쿠키와 로컬 스토리지에서 로그인 정보 복원
  useEffect(() => {
    // 쿠키에서 userRole 확인 (auth-token은 httpOnly라 읽을 수 없음)
    const roleCookie = getCookie("userRole");

    // 로컬 스토리지 확인
    const storedEmail = localStorage.getItem("email");
    const storedToken = localStorage.getItem("token");

    // 백엔드 API를 통해 현재 인증 상태 확인 - UserService 사용
    const checkAuthStatus = async () => {
      try {
        // UserService의 getCurrentUser 함수 호출
        const authData = await getCurrentUser();

        if (authData.isAuthenticated) {
          setEmail(authData.email || "");
          setUserRole(authData.role || roleCookie || "");
          setNickname(authData.nickname || "");
          setIsLoggedIn(true);

          // 로컬 스토리지에도 저장 (선택적)
          localStorage.setItem("email", authData.email || "");
          localStorage.setItem("userRole", authData.role || roleCookie || "");
        } else {
          console.error("인증되지 않은 상태 (API 응답)");
        }
      } catch (error) {
        console.error("인증 상태 확인 중 오류:", error);
      }
    };

    // 쿠키가 있거나 로컬 스토리지에 정보가 있으면 인증 상태 확인
    if (roleCookie || (storedEmail && storedToken)) {
      checkAuthStatus();
    }
  }, []);

  const login = (
    email: string,
    token: string,
    role: string = "",
    nickname: string = ""
  ) => {
    setEmail(email);
    setToken(token);
    setIsLoggedIn(true);
    setUserRole(role);
    setNickname(nickname);

    // 로컬 스토리지에도 저장
    localStorage.setItem("email", email);
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("nickname", nickname);
  };

  const logout = () => {
    setEmail("");
    setToken(null);
    setIsLoggedIn(false);
    setUserRole("");
    setNickname("");

    localStorage.removeItem("email");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("nickname");
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, email, token, userRole, nickname, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
