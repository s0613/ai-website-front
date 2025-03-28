// components/navbar/UserMenu.tsx
"use client";
import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "./UserAvatar";

interface Props {
  email: string;
  nickname: string;
  userRole: string | null;
  onLogout: () => void;
  onBadgeClick: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const UserMenu = ({
  email,
  nickname,
  userRole,
  onLogout,
  onBadgeClick,
  isOpen,
  setOpen,
}: Props) => {
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
          </div>
          <Link
            href="/my"
            className="block px-4 py-2 text-sm hover:bg-sky-50 hover:text-sky-600"
          >
            내정보
          </Link>
          {userRole === "admin" && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm hover:bg-sky-50 hover:text-sky-600"
            >
              관리자 페이지
            </Link>
          )}
          <button
            onClick={onLogout}
            className="w-full text-left block px-4 py-2 text-sm hover:bg-sky-50 hover:text-sky-600"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};
