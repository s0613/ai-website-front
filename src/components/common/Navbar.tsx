"use client";
import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, email, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Close dropdown when clicking outside
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative">
        {/* 로고: 호버 효과 제거 */}
        <Link href="/" className="text-2xl font-bold text-gray-800 px-2 py-1 rounded">
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
          <Link href="/blog/blogList" className="hover:bg-gray-100 px-2 py-1 rounded">
            블로그
          </Link>
          <Link href="/contact" className="hover:bg-gray-100 px-2 py-1 rounded">
            광고
          </Link>
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="text-gray-800 hover:bg-gray-100 px-2 py-1 rounded focus:outline-none"
              >
                {email}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg">
                  <Link
                    href="/my"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    내정보
                  </Link>
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
              <Link href="/login" className="hover:bg-gray-100 px-2 py-1 rounded">
                로그인
              </Link>
              <Link href="/signup" className="hover:bg-gray-100 px-2 py-1 rounded">
                회원가입
              </Link>
            </>
          )}
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-800 focus:outline-none hover:bg-gray-100 p-2 rounded">
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <Link href="/blog/blogList" className="block py-2 text-gray-600 hover:bg-gray-100 rounded">
            블로그
          </Link>
          <Link href="/contact" className="block py-2 text-gray-600 hover:bg-gray-100 rounded">
            광고
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/my" className="block py-2 text-gray-600 hover:bg-gray-100 rounded">
                내정보
              </Link>
              <button onClick={handleLogout} className="block w-full text-left py-2 text-gray-600 hover:bg-gray-100 rounded">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-gray-600 hover:bg-gray-100 rounded">
                로그인
              </Link>
              <Link href="/signup" className="block py-2 text-gray-600 hover:bg-gray-100 rounded">
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
