"use client";
import React, { useRef, useEffect, useState } from "react";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // AuthContext에서 직접 값 받아오기
  const { isLoggedIn, email, logout, userRole } = useAuth();

  // UI 관련 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Avatar를 위한 이니셜 생성
  const getInitials = (email: string) => {
    if (!email) return "?";
    return email.split("@")[0].charAt(0).toUpperCase();
  };

  // Dropdown 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative">
        {/* 로고 */}
        <Link
          href="/"
          className="text-2xl font-bold text-gray-800 px-2 py-1 rounded"
        >
          Crazy Space
        </Link>

        {/* 검색창 */}
        <div className="flex-1 mx-4 relative">
          <input
            type="text"
            placeholder="사진과 일러스트 검색"
            className="w-full h-10 border border-gray-300 rounded-full pl-10 pr-4 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        </div>

        {/* 내비게이션 링크 (데스크탑) */}
        <nav className="hidden md:flex space-x-8 text-gray-600 items-center">
          <Link
            href="/blog/blogList"
            className="hover:bg-gray-100 px-2 py-1 rounded"
          >
            BLOG
          </Link>
          <Link href="/contact" className="hover:bg-gray-100 px-2 py-1 rounded">
            Contact Us
          </Link>
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar와 dropdown 메뉴 */}
              <div
                className="cursor-pointer"
                onMouseEnter={() => setIsDropdownOpen(true)}
              >
                <Avatar className="hover:ring-2 hover:ring-gray-300">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${email}`}
                    alt={email}
                  />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {getInitials(email)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{email}</p>
                  </div>
                  <Link
                    href="/my"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    내정보
                  </Link>
                  {userRole === "admin" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      관리자 페이지
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                className="hover:bg-gray-100 px-2 py-1 rounded"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="hover:bg-gray-100 px-2 py-1 rounded"
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
            className="text-gray-800 focus:outline-none hover:bg-gray-100 p-2 rounded"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <Link
            href="/blog/blogList"
            className="block py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            BLOG
          </Link>
          <Link
            href="/contact"
            className="block py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Contact Us
          </Link>
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 py-2 text-gray-600">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${email}`}
                    alt={email}
                  />
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {getInitials(email)}
                  </AvatarFallback>
                </Avatar>
                <span>{email}</span>
              </div>
              <Link
                href="/my"
                className="block py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                내정보
              </Link>
              {userRole === "admin" && (
                <Link
                  href="/admin"
                  className="block py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  관리자 페이지
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="block py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
