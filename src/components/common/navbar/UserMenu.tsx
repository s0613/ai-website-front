// components/navbar/UserMenu.tsx
"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserAvatar } from "./UserAvatar";
import { logout as userLogout } from "@/features/user/services/UserService";

interface Props {
  email: string;
  nickname: string;
  credits: number | null;
  onLogout: () => void;
  onBadgeClick: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const UserMenu = ({
  email,
  nickname,
  credits,
  onLogout,
  isOpen,
  setOpen,
}: Props) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await userLogout(); // UserService의 logout 함수 호출
      onLogout(); // 기존 로그아웃 로직 실행 (상태 초기화)
      router.push("/"); // 홈으로 이동
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)}>
      <UserAvatar email={email} />

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-4 py-3 border-b bg-gray-50">
            <p className="text-sm font-medium text-gray-900">
              {nickname || email}
            </p>
            {credits !== null && (
              <p className="text-sm text-sky-600 mt-1">
                {credits} 크레딧
              </p>
            )}
          </div>
          <Link
            href="/my"
            className="block px-4 py-2 text-sm hover:bg-sky-50 hover:text-sky-600"
          >
            내정보
          </Link>
          <Link
            href="/payment"
            className="block px-4 py-2 text-sm hover:bg-sky-50 hover:text-sky-600"
          >
            크레딧 충전
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 text-sm hover:bg-sky-50 hover:text-sky-600"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};
