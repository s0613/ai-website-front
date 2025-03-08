"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

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
  email: "",
  token: null,
  userRole: "",
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState("");

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
    console.log("쿠키에서 확인한 userRole:", roleCookie);

    // 로컬 스토리지 확인
    const storedEmail = localStorage.getItem("email");
    const storedToken = localStorage.getItem("token");
    console.log("로컬 스토리지 확인:", {
      storedEmail,
      hasToken: !!storedToken,
    });

    // 백엔드 API를 통해 현재 인증 상태 확인
    const checkAuthStatus = async () => {
      try {
        console.log("쿠키 확인:", document.cookie); // 현재 쿠키 상태 확인

        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // 쿠키를 포함하여 요청
        });

        if (response.ok) {
          const data = await response.json();
          console.log("인증 API 응답:", data);
          console.log("응답 헤더:", [...response.headers.entries()]); // 응답 헤더 로깅

          setEmail(data.email);
          setUserRole(data.role || roleCookie || "");
          setIsLoggedIn(true);

          // 로컬 스토리지에도 저장 (선택적)
          localStorage.setItem("email", data.email);
          localStorage.setItem("userRole", data.role || roleCookie || "");

          console.log("인증 상태 설정 완료:", {
            email: data.email,
            role: data.role || roleCookie,
            isLoggedIn: true,
            cookies: document.cookie, // 인증 후 쿠키 상태 확인
          });
        } else {
          console.log("인증되지 않은 상태 (API 응답)");
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

  const login = (email: string, token: string, role: string = "") => {
    console.log("AuthContext login 호출됨, 역할:", role);

    setEmail(email);
    setToken(token);
    setIsLoggedIn(true);
    setUserRole(role);

    // 로컬 스토리지에도 저장
    localStorage.setItem("email", email);
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);

    console.log("로그인 처리 완료:", { email, role, isLoggedIn: true });
  };

  const logout = () => {
    setEmail("");
    setToken(null);
    setIsLoggedIn(false);
    setUserRole("");

    localStorage.removeItem("email");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");

    // 백엔드에 로그아웃 요청 (쿠키 제거)
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch((err) => console.error("로그아웃 요청 실패:", err));
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, email, token, userRole, login, logout }}
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
