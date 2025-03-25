"use client";
import React, { useRef, useEffect, useState } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { Bell, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 유저 아바타 컴포넌트
const UserAvatar = ({ email }: { email: string }) => (
  <Avatar className="border-2 border-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-sky-100 group">
    <AvatarImage
      key={email}
      src={`https://api.dicebear.com/6.x/initials/svg?seed=${email}`}
      alt={email}
      className="group-hover:scale-110 transition-transform duration-500"
    />
    <AvatarFallback className="bg-sky-500 text-white">
      {email?.split("@")[0]?.charAt(0).toUpperCase() || "?"}
    </AvatarFallback>
  </Avatar>
);

const Navbar = () => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, email, logout, userRole, nickname } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: number; message: string; date: string }[]
  >([]);

  useEffect(() => {
    setNotifications([
      { id: 1, message: "새로운 댓글이 달렸습니다.", date: "2025-03-25" },
      { id: 2, message: "프로필이 업데이트되었습니다.", date: "2025-03-24" },
    ]);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationOpen((prev) => !prev);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const handleBadgeClick = () => router.push("/payment");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-100 border-b border-gray-200/50 shadow-sm sticky top-0 z-50 h-16 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">
        {/* 로고 */}
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 px-3 py-1 rounded-full flex items-center group transition-all duration-300"
        >
          <Sparkles className="w-5 h-5 mr-2 text-sky-500 transform group-hover:rotate-12 transition-transform duration-300" />
          <span className="group-hover:text-sky-600 transition-colors duration-300">
            Crazy Space
          </span>
        </Link>

        {/* 검색창 */}
        <div className="flex-1 mx-4 relative">
          <label htmlFor="navbar-search" className="sr-only">
            사진과 일러스트 검색
          </label>
          <input
            id="navbar-search"
            type="text"
            placeholder="사진과 일러스트 검색"
            className="w-full h-10 border border-gray-300 rounded-full pl-10 pr-4 bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-200 shadow-sm transition-all duration-300 focus:shadow-md"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        </div>

        {/* 데스크탑 네비게이션 */}
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
                <Badge
                  variant="outline"
                  className="mr-2 capitalize border-sky-400 text-sky-600 cursor-pointer hover:bg-sky-50 transition"
                  onClick={handleBadgeClick}
                >
                  {userRole}
                </Badge>
              )}

              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 rounded-full hover:bg-white hover:text-sky-500 transition"
                  onClick={toggleNotifications}
                >
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>

                {isNotificationOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">알림</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="px-4 py-2 border-b hover:bg-gray-50 transition"
                          >
                            <p className="text-sm text-gray-800">{n.message}</p>
                            <p className="text-xs text-gray-500">{n.date}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                          새로운 알림이 없습니다
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="cursor-pointer"
                onMouseEnter={() => setIsDropdownOpen(true)}
              >
                <UserAvatar email={email} />
              </div>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
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
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-sky-50 hover:text-sky-600"
                  >
                    로그아웃
                  </button>
                </div>
              )}
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

        {/* 모바일 메뉴 버튼 */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-800 focus:outline-none hover:bg-white p-2 rounded-full shadow-sm transition"
          >
            {isMenuOpen ? (
              <FiX className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 bg-white shadow-lg rounded-b-xl mt-1 mx-2 border border-gray-200/70 transition">
          <Link
            href="/blog/blogList"
            className="block py-2.5 my-1 px-3 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            BLOG
          </Link>
          <Link
            href="/contact"
            className="block py-2.5 my-1 px-3 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact Us
          </Link>
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 py-2.5 my-1 px-3 bg-gray-50 rounded-lg">
                <UserAvatar email={email} />
                <span className="font-medium">{nickname || email}</span>
                {userRole && (
                  <Badge
                    variant="outline"
                    className="ml-auto capitalize border-sky-400 text-sky-600 bg-white shadow-sm"
                    onClick={handleBadgeClick}
                  >
                    {userRole}
                  </Badge>
                )}
              </div>
              <Link
                href="/my"
                className="block py-2.5 my-1 px-3 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                내정보
              </Link>
              {userRole === "admin" && (
                <Link
                  href="/admin"
                  className="block py-2.5 my-1 px-3 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  관리자 페이지
                </Link>
              )}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left py-2.5 my-1 px-3 hover:bg-gray-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link
                href="/login"
                className="block py-2.5 text-center bg-gray-100 hover:bg-gray-200 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="block py-2.5 text-center bg-sky-500 text-white hover:bg-sky-600 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
