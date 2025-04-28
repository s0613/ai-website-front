"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useAuth } from "@/pages/user/AuthContext";
import { login as loginApi, getGoogleLoginUrl } from "../services/UserService";
import { LoginRequest } from "../types/User";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  // 이메일/비밀번호 로그인
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const loginRequest: LoginRequest = { email, password };
      const data = await loginApi(loginRequest);

      const token = data.token;
      if (!token) {
        throw new Error("토큰이 전달되지 않았습니다.");
      }

      // API 응답에서 role 정보 추출
      const role = data.role || "user"; // role이 없으면 기본값으로 'user' 설정
      console.log("로그인 성공, 역할:", role);

      setError("");
      // role 정보를 login 함수에 전달
      login(email, token, role);

      // 로그인 완료 후 쿠키 확인
      console.log("로그인 완료 후 최종 쿠키 상태:", document.cookie);

      router.push("/");
    } catch (error) {
      setError((error as Error).message || "로그인에 실패했습니다");
    }
  };

  // 구글 로그인 버튼 클릭 시
  const handleGoogleLogin = () => {
    window.location.href = getGoogleLoginUrl();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            로그인
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 이메일 로그인 폼은 숨김 처리 */}
          <div className="hidden">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-400"
                >
                  이메일
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full bg-black/40 backdrop-blur-xl border-white/20 text-white"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-400"
                >
                  비밀번호
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full bg-black/40 backdrop-blur-xl border-white/20 text-white"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                이메일/비밀번호 로그인
              </Button>
            </form>
          </div>

          {/* 구글 로그인 버튼만 표시 */}
          <Button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
            onClick={handleGoogleLogin}
          >
            <svg
              className="w-5 h-5"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              style={{ display: "block" }}
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span>구글 로그인</span>
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-400">
            계정이 없으신가요?{" "}
            <a href="/signup" className="text-sky-500 hover:text-sky-400">
              회원가입
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
