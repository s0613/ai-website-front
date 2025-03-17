"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Search, Settings } from "lucide-react";

const MyPage = () => {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0">
        <div className="w-96">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input type="search" placeholder="파일 검색..." className="pl-9" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Home className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        <Tabs defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">최근</TabsTrigger>
            <TabsTrigger value="starred">즐겨찾기</TabsTrigger>
            <TabsTrigger value="shared">공유됨</TabsTrigger>
          </TabsList>

          {/* 탭 내용이 들어갈 영역 */}
          <div className="mt-4">{/* 탭 내용 */}</div>
        </Tabs>
      </div>
    </div>
  );
};

export default MyPage;
