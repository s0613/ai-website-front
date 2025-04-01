// components/navbar/MobileMenu.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "./UserAvatar";
import { logout as userLogout } from "@/features/user/services/UserService";

interface Props {
  isLoggedIn: boolean;
  email: string;
  nickname: string;
  credits: number | null;
  onLogout: () => void;
  onBadgeClick: () => void;
  closeMenu: () => void;
}

export const MobileMenu = ({
  isLoggedIn,
  email,
  nickname,
  credits,
  onLogout,
  closeMenu,
}: Props) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await userLogout(); // UserService의 logout 함수 호출
      closeMenu();
      onLogout(); // 기존 로그아웃 로직 실행 (상태 초기화)
      router.push("/"); // 홈으로 이동
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

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
            {credits !== null && (
              <Link href="/payment" passHref>
                <Badge
                  variant="outline"
                  className="px-2 py-0.5 text-base font-semibold capitalize border-sky-400 text-sky-600 cursor-pointer hover:bg-sky-50 transition"
                >
                  {credits.toLocaleString()} 크레딧
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
          <button
            onClick={handleLogout}
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
