"use client";

import React from "react";
// 사용하지 않는 컴포넌트와 아이콘 제거
import { FileText, Image, MessageSquare, Layers, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  {
    icon: FileText,
    label: "홈",
    href: "/my",
  },
  {
    icon: Image,
    label: "내 이미지",
    href: "/my/image",
  },
  {
    icon: Video,
    label: "내 영상",
    href: "/my/video",
  },

  {
    icon: MessageSquare,
    label: "프로필",
    href: "/my/chat",
  },
  {
    icon: Layers,
    label: "설정",
    href: "/my/models",
  },
];

interface MyPageLayoutProps {
  children: React.ReactNode;
}

const MyPageLayout: React.FC<MyPageLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  // email 변수를 사용하지 않는 경고를 해결하기 위해,
  // 필요하다면 UI에 표시하거나, 아니면 아래와 같이 주석으로 처리할 수 있습니다.
  // 여기서는 헤더에 이메일을 표시하는 예를 추가합니다.

  return (
    <div className="grid min-h-screen grid-cols-[16rem_1fr]">
      <div className="border-r">
        <div className="flex h-[57px] items-center border-b px-6">
          <span>AI Content Platform</span>
        </div>
        <div className="flex-1 py-4">
          <nav className="grid gap-1 px-2">
            {sidebarItems.map((item, idx) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="flex flex-col">
        {/* 로그인 정보 표시 부분 제거 */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

export default MyPageLayout;
