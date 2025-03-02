"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Bell, Grid, LayoutGrid, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg", active && "bg-gray-100")}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function FolderItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
      <span>{children}</span>
    </Link>
  );
}

function FileCard({ title, metadata, thumbnail }: { title: string; metadata: string; thumbnail: string }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white">
      <div className="aspect-[4/3] overflow-hidden">
        <Image
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          width={400}
          height={300}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{metadata}</p>
      </div>
    </div>
  );
}

const MyPage = () => {
  const { email } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] bg-white">
      {/* 사이드바 */}
      <div className="w-64 border-r bg-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">마이페이지</h1>
        </div>
        <nav className="space-y-1 px-2">
          <NavItem href="/my" icon={<LayoutGrid className="h-4 w-4" />} active>
            모든 콘텐츠
          </NavItem>
          <NavItem
            href="/my/profile"
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          >
            프로필
          </NavItem>
          <NavItem
            href="/my/settings"
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            설정
          </NavItem>
          
          <div className="py-3">
            <div className="px-3 text-xs font-medium uppercase text-gray-500">이미지</div>
            <div className="mt-2">
              <FolderItem href="/my/saved-images">저장한 이미지</FolderItem>
              <FolderItem href="/my/generated-images">생성한 이미지</FolderItem>
              <FolderItem href="/my/uploaded-images">올린 이미지</FolderItem>
            </div>
          </div>
          
          <div className="py-3">
            <div className="px-3 text-xs font-medium uppercase text-gray-500">영상</div>
            <div className="mt-2">
              <FolderItem href="/my/created-videos">만든 영상</FolderItem>
              <FolderItem href="/my/reference-videos">레퍼런스 영상</FolderItem>
            </div>
          </div>
          
          <div className="py-3">
            <div className="px-3 text-xs font-medium uppercase text-gray-500">기타</div>
            <div className="mt-2">
              <FolderItem href="/my/usage">사용량</FolderItem>
              <FolderItem href="/my/wallet">지갑</FolderItem>
            </div>
          </div>
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div className="w-96">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="파일 검색..." className="pl-9" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              <div className="mr-2 text-sm font-medium">{email}</div>
              <div className="h-8 w-8 overflow-hidden rounded-full bg-blue-500 text-white flex items-center justify-center">
                {email ? email.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              새로 만들기
            </Button>
            <Button variant="outline" className="gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              업로드
            </Button>
            <Button variant="outline" className="gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              폴더 만들기
            </Button>
          </div>

          <div className="mb-6">
            <Tabs defaultValue="recent">
              <TabsList>
                <TabsTrigger value="recent">최근</TabsTrigger>
                <TabsTrigger value="starred">즐겨찾기</TabsTrigger>
                <TabsTrigger value="shared">공유됨</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FileCard title="저장한 이미지" metadata="폴더 • 8개의 이미지" thumbnail="/placeholder.svg" />
            <FileCard title="생성한 이미지" metadata="폴더 • 5개의 이미지" thumbnail="/placeholder.svg" />
            <FileCard title="만든 영상" metadata="폴더 • 3개의 영상" thumbnail="/placeholder.svg" />
            <FileCard title="사용량" metadata="비용 및 사용 통계" thumbnail="/placeholder.svg" />
            <FileCard title="지갑" metadata="결제 정보 및 내역" thumbnail="/placeholder.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;