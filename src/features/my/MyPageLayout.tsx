"use client";

import React from "react";
import {
  Image,
  Settings,
  Folder,
  Heart,
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
    icon: Image,
    label: "작업물",
    href: "/my",
  },
  {
    icon: Heart,
    label: "좋아요",
    href: "/my/liked",
  },
  {
    icon: Folder,
    label: "폴더",
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
    <div className="flex min-h-[calc(100vh-64px)] bg-black">
      {/* 사이드바 */}
      <div className="w-64 border-r border-white/20 bg-black/40 backdrop-blur-xl flex-shrink-0 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-2">
            {sidebarItems.map((item, idx) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "flex items-center w-full px-4 py-3 rounded-lg transition-all hover:translate-x-1",
                    isActive
                      ? "bg-sky-500/20 text-sky-400"
                      : "text-gray-400 hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-sky-400" : "text-gray-400")} />
                  <span className={cn("font-medium", isActive ? "text-sky-400" : "")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-sky-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-auto">
        <main className="flex-1 p-6">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5 h-full">
            <div className="px-8 py-6 h-full">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyPageLayout;
