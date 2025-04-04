// components/navbar/MobileMenu.tsx
"use client";
import React from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "./UserAvatar";
import { logout as userLogout } from "@/features/user/services/UserService";

interface Props {
  isLoggedIn: boolean;
  email: string;
  nickname: string;
  credits: number;
  onLogout: () => void;
  onClose: () => void;
}

export const MobileMenu = ({
  isLoggedIn,
  email,
  nickname,
  credits,
  onLogout,
  onClose,
}: Props) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await userLogout();
      onLogout();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-black/95">
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-white hover:text-sky-500 focus:outline-none"
          >
            닫기
          </button>
        </div>

        <div className="flex-1 px-4 py-2">
          <nav className="space-y-1 mb-6">
            <Link
              href="/blog/blogList"
              className="block px-4 py-2 text-white hover:bg-white/5 rounded-lg"
              onClick={onClose}
            >
              블로그
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-white hover:bg-white/5 rounded-lg"
              onClick={onClose}
            >
              문의하기
            </Link>
          </nav>

          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-white/5">
                <UserAvatar email={email} />
                <div>
                  <p className="font-medium text-white">{nickname || email}</p>
                  <p className="text-sm text-sky-500">{credits} 크레딧</p>
                </div>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/my"
                  className="block px-4 py-2 text-white hover:bg-white/5 rounded-lg"
                  onClick={onClose}
                >
                  내 정보
                </Link>
                <Link
                  href="/billing"
                  className="block px-4 py-2 text-white hover:bg-white/5 rounded-lg"
                  onClick={onClose}
                >
                  크레딧 충전
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    onClose();
                  }}
                  className="w-full text-left block px-4 py-2 text-white hover:bg-white/5 rounded-lg"
                >
                  로그아웃
                </button>
              </nav>
            </>
          ) : (
            <div className="space-y-4">
              <Link
                href="/login"
                className="block w-full py-2 text-center text-white bg-sky-500 hover:bg-sky-600 rounded-lg"
                onClick={onClose}
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="block w-full py-2 text-center text-white bg-white/10 hover:bg-white/20 rounded-lg"
                onClick={onClose}
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
