"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/features/user/AuthContext";
import { DesktopNav } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";
import { BillingService } from "@/features/payment/services/BillingService";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

const Navbar = () => {
  const { isLoggedIn, email, logout, nickname } = useAuth();
  const router = useRouter();
  const [creditInfo, setCreditInfo] = useState<{ currentCredit: number } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadCreditInfo();
    }
  }, [isLoggedIn]);

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

  return (
    <header className="bg-black shadow-[0_8px_30px_rgb(0,0,0,0.12)] sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative">
        <Link
          href="/"
          className="text-2xl font-bold text-white px-3 py-1 rounded-full flex items-center group transition-all duration-300 hover:bg-white/5"
        >
          <Sparkles className="w-5 h-5 mr-2 text-sky-500 transform group-hover:rotate-12 transition-transform duration-300" />
          <span className="group-hover:text-sky-500 transition-colors duration-300">
            Trynic
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
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
          {isLoggedIn ? (
            <>
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
                isOpen={isNotificationOpen}
                toggle={toggleNotifications}
                onMouseLeave={() => setIsNotificationOpen(false)}
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
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-white hover:text-sky-500 px-4 py-2 rounded-lg transition-colors duration-300 bg-sky-500/20 hover:bg-sky-500/30 backdrop-blur-md"
              >
                로그인
              </Link>
            </div>
          )}
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
