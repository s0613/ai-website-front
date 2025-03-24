"use client";

import React from "react";
import { Home, Image, Settings, Folder } from "lucide-react";
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
    icon: Home,
    label: "홈",
    href: "/my",
  },
  {
    icon: Image,
    label: "내 작업물",
    href: "/my/creation",
  },
  {
    icon: Folder,
    label: "내 폴더",
    href: "/my/folder/my",
  },
  {
    icon: Settings,
    label: "설정",
    href: "/my/setting",
  },
];

interface MyPageLayoutProps {
  children: React.ReactNode;
}

const MyPageLayout: React.FC<MyPageLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 사이드바 - 고정 너비, 전체 높이, 자체 스크롤 */}
      <div className="w-64 border-r flex-shrink-0 h-full overflow-y-auto">
        <div className="py-4">
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

      {/* 메인 콘텐츠 영역 - 남은 공간 채우고, 자체 스크롤 */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default MyPageLayout;
