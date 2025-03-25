// components/navbar/DesktopNav.tsx
"use client";
import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

interface Props {
  isLoggedIn: boolean;
  email: string;
  nickname: string;
  userRole: string | null;
  notifications: { id: number; message: string; date: string }[];
  isDropdownOpen: boolean;
  setIsDropdownOpen: (value: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (value: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  notificationRef: React.RefObject<HTMLDivElement>;
  handleLogout: () => void;
  handleBadgeClick: () => void;
  toggleNotifications: (e: React.MouseEvent) => void;
}

export const DesktopNav = ({
  isLoggedIn,
  email,
  nickname,
  userRole,
  notifications,
  isDropdownOpen,
  setIsDropdownOpen,
  isNotificationOpen,
  setIsNotificationOpen,
  dropdownRef,
  notificationRef,
  handleLogout,
  handleBadgeClick,
  toggleNotifications,
}: Props) => {
  return (
    <nav className="hidden md:flex space-x-6 text-gray-700 items-center">
      <Link
        href="/blog/blogList"
        className="hover:text-sky-600 hover:bg-white px-3 py-1.5 rounded-full transition"
      >
        BLOG
      </Link>
      <Link
        href="/contact"
        className="hover:text-sky-600 hover:bg-white px-3 py-1.5 rounded-full transition"
      >
        Contact Us
      </Link>

      {isLoggedIn ? (
        <div className="relative flex items-center" ref={dropdownRef}>
          {userRole && (
            <Link href="/payment" passHref>
              <Badge
                variant="outline"
                className="mr-2 capitalize border-sky-400 text-sky-600 cursor-pointer hover:bg-sky-50 transition"
              >
                {userRole}
              </Badge>
            </Link>
          )}

          <NotificationBell
            notifications={notifications}
            isOpen={isNotificationOpen}
            toggle={toggleNotifications}
            refObj={notificationRef}
          />

          <UserMenu
            email={email}
            nickname={nickname}
            userRole={userRole}
            onLogout={handleLogout}
            onBadgeClick={handleBadgeClick}
            isOpen={isDropdownOpen}
            setOpen={setIsDropdownOpen}
          />
        </div>
      ) : (
        <>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full bg-white shadow-sm hover:text-sky-600"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 rounded-full bg-sky-500 text-white hover:bg-sky-600"
          >
            회원가입
          </Link>
        </>
      )}
    </nav>
  );
};
