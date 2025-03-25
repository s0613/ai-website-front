// components/navbar/MobileMenu.tsx
"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "./UserAvatar";

interface Props {
  isLoggedIn: boolean;
  email: string;
  nickname: string;
  userRole: string | null;
  onLogout: () => void;
  onBadgeClick: () => void;
  closeMenu: () => void;
}

export const MobileMenu = ({
  isLoggedIn,
  email,
  nickname,
  userRole,
  onLogout,
  onBadgeClick,
  closeMenu,
}: Props) => {
  return (
    <div className="md:hidden px-4 pb-4 bg-white shadow-lg rounded-b-xl mt-1 mx-2 border border-gray-200/70 transition">
      <Link
        href="/blog/blogList"
        className="block py-2.5 my-1 px-3 hover:bg-gray-50"
        onClick={closeMenu}
      >
        BLOG
      </Link>
      <Link
        href="/contact"
        className="block py-2.5 my-1 px-3 hover:bg-gray-50"
        onClick={closeMenu}
      >
        Contact Us
      </Link>

      {isLoggedIn ? (
        <>
          <div className="flex items-center gap-3 py-2.5 my-1 px-3 bg-gray-50 rounded-lg">
            <UserAvatar email={email} />
            <span className="font-medium">{nickname || email}</span>
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
          </div>
          <Link
            href="/my"
            className="block py-2.5 my-1 px-3 hover:bg-gray-50"
            onClick={closeMenu}
          >
            내정보
          </Link>
          {userRole === "admin" && (
            <Link
              href="/admin"
              className="block py-2.5 my-1 px-3 hover:bg-gray-50"
              onClick={closeMenu}
            >
              관리자 페이지
            </Link>
          )}
          <button
            onClick={() => {
              closeMenu();
              onLogout();
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
            onClick={closeMenu}
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="block py-2.5 text-center bg-sky-500 text-white hover:bg-sky-600 rounded-lg"
            onClick={closeMenu}
          >
            회원가입
          </Link>
        </div>
      )}
    </div>
  );
};
