"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/features/user/AuthContext";
import { DesktopNav } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";
import { BillingService } from "@/features/payment/services/BillingService";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

interface Notification {
  id: number;
  message: string;
  date: string;
}

const Navbar = () => {
  const { isLoggedIn, email, logout, nickname } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [creditInfo, setCreditInfo] = useState<{ currentCredit: number } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: "크레딧이 충전되었습니다.", date: "방금 전" }
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCreditInfo();
  }, []);

  const loadCreditInfo = async () => {
    try {
      const response = await BillingService.getCurrentCredit();
      setCreditInfo(response);
    } catch (error) {
      console.error("Failed to load credit info:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleBadgeClick = () => {
    router.push('/payment');
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationOpen(!isNotificationOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-black shadow-[0_8px_30px_rgb(0,0,0,0.12)] sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">
        <Link
          href="/"
          className="text-2xl font-bold text-white px-3 py-1 rounded-full flex items-center group transition-all duration-300 hover:bg-white/5"
        >
          <Sparkles className="w-5 h-5 mr-2 text-sky-500 transform group-hover:rotate-12 transition-transform duration-300" />
          <span className="group-hover:text-sky-500 transition-colors duration-300">
            Crazy Space
          </span>
        </Link>

        <div className="flex-1 mx-4 relative">
          <form onSubmit={handleSearch} className="relative">
            <label htmlFor="navbar-search" className="sr-only">
              원하는 영상 콘셉트를 입력하세요
            </label>
            <input
              id="navbar-search"
              type="text"
              placeholder="원하는 영상 콘셉트를 입력하세요 (예: 우주 여행 영상, 제품 광고)"
              className="w-full h-10 border border-white/10 rounded-full pl-10 pr-4 bg-black/30 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <FiSearch className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/blog/blogList"
              className="text-gray-300 hover:text-sky-500 px-3 py-2 rounded-lg transition-colors duration-300"
            >
              블로그
            </Link>
            <Link
              href="/contact"
              className="text-gray-300 hover:text-sky-500 px-3 py-2 rounded-lg transition-colors duration-300"
            >
              문의하기
            </Link>
          </div>
          <Link href="/billing" className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 backdrop-blur-xl border border-[#ff00ff]/20 hover:border-[#00ffff]/40 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff00ff]/10 to-[#00ffff]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#ff00ff,#00ffff,#ff00ff)] opacity-[0.15] animate-spin-slow"></div>
            <div className="relative flex items-center">
              <span className="text-sm font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff] animate-pulse">
                {creditInfo?.currentCredit || 0}
              </span>
              <span className="ml-2 text-sm font-medium text-white/80 group-hover:text-white/90 transition-colors duration-300">크레딧</span>
            </div>
            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#ff00ff] to-[#00ffff] opacity-20 group-hover:opacity-30 blur-sm transition-opacity duration-300"></div>
          </Link>
          <NotificationBell
            notifications={notifications}
            isOpen={isNotificationOpen}
            toggle={toggleNotifications}
            refObj={notificationRef}
          />
          <UserMenu
            email={email}
            nickname={nickname}
            credits={creditInfo?.currentCredit || 0}
            onLogout={handleLogout}
            onBadgeClick={handleBadgeClick}
            isOpen={isDropdownOpen}
            setOpen={setIsDropdownOpen}
          />
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-sky-500 focus:outline-none p-2"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <MobileMenu
          isLoggedIn={isLoggedIn}
          email={email}
          nickname={nickname}
          credits={creditInfo?.currentCredit || 0}
          onLogout={handleLogout}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
