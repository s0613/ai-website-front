"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { Sparkles, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DesktopNav } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";

const Navbar = () => {
  const { isLoggedIn, email, logout, userRole, nickname } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: number; message: string; date: string }[]
  >([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications([
      { id: 1, message: "새로운 댓글이 달렸습니다.", date: "2025-03-25" },
      { id: 2, message: "프로필이 업데이트되었습니다.", date: "2025-03-24" },
    ]);
  }, []);

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

  const handleLogoutOnly = () => {
    logout();
    // No router.push
  };

  const handleBadgeClick = () => {
    // Still client-side, use <Link> for navigation instead of programmatic
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationOpen((prev) => !prev);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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
          <form onSubmit={handleSearch} className="relative">
            <label htmlFor="navbar-search" className="sr-only">
              원하는 영상 콘셉트를 입력하세요
            </label>
            <input
              id="navbar-search"
              type="text"
              placeholder="원하는 영상 콘셉트를 입력하세요 (예: 우주 여행 영상, 제품 광고)"
              className="w-full h-10 border border-gray-300 rounded-full pl-10 pr-4 bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-200 shadow-sm transition-all duration-300 focus:shadow-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              <FiSearch className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* 데스크탑 네비게이션 */}
        <DesktopNav
          isLoggedIn={isLoggedIn}
          email={email}
          nickname={nickname}
          userRole={userRole}
          notifications={notifications}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          isNotificationOpen={isNotificationOpen}
          setIsNotificationOpen={setIsNotificationOpen}
          dropdownRef={dropdownRef}
          notificationRef={notificationRef}
          handleLogout={handleLogoutOnly}
          handleBadgeClick={handleBadgeClick}
          toggleNotifications={toggleNotifications}
        />

        {/* 모바일 메뉴 버튼 */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
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
        <MobileMenu
          isLoggedIn={isLoggedIn}
          email={email}
          nickname={nickname}
          userRole={userRole}
          onLogout={handleLogoutOnly}
          onBadgeClick={handleBadgeClick}
          closeMenu={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
