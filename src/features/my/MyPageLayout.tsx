"use client";

import React from "react";
import {
  Home,
  Image,
  Settings,
  Folder,
  User,
  ChevronRight,
} from "lucide-react";
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
    <div className="flex min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200">
      {/* 사이드바 */}
      <div className="w-64 border-r border-gray-200 bg-white shadow-sm flex-shrink-0 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-100 text-sky-600 rounded-full p-2">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">마이페이지</h2>
              <p className="text-xs text-gray-500">계정 및 콘텐츠 관리</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {sidebarItems.map((item, idx) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:translate-x-1",
                    isActive
                      ? "bg-sky-50 text-sky-600"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <div className={isActive ? "text-sky-500" : "text-gray-500"}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      "font-medium",
                      isActive ? "text-sky-600" : ""
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-sky-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            계정 활성화됨
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-auto">
        <main className="flex-1 p-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/80 p-6 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyPageLayout;
