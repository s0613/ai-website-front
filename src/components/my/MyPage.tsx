"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Grid, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const MyPage = () => {
  const { email } = useAuth();

  return (
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
      <div className="m-4">
        <Tabs defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">최근</TabsTrigger>
            <TabsTrigger value="starred">즐겨찾기</TabsTrigger>
            <TabsTrigger value="shared">공유됨</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default MyPage;