"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

export default function VideoSidebar() {
  const [message, setMessage] = useState("");

  // 폴더 생성 로직
  const handleCreateFolder = async () => {
    try {
      const res = await fetch("/api/admin/video/folder", { method: "POST" });
      if (!res.ok) {
        throw new Error("폴더 생성 실패");
      }
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("폴더 생성 중 오류 발생");
    }
  };

  return (
    <div className="relative p-4 min-h-screen">
      <Sheet>
        <SheetTrigger asChild>
          {/* 부모가 relative이므로 absolute 좌표 사용 가능 */}
          <button className="top-2 left-2 p-2">
            <Image
              src="/icons8-folder-96.svg"
              alt="Sidebar 열기"
              width={32}
              height={32} 
            />
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[280px] bg-gray-50">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold">Video Sidebar</SheetTitle>
            <SheetDescription className="mt-2 text-sm text-gray-600">
              여기에 설명 등을 넣을 수 있습니다.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <button
              onClick={handleCreateFolder}
              className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
            >
              폴더 생성
            </button>
            {message && (
              <p className="mt-2 text-sm text-gray-800 whitespace-pre-line">
                {message}
              </p>
            )}
          </div>

          {/* 시트 닫기 버튼 */}
          <SheetClose asChild>
            <button className="absolute bottom-4 right-4 rounded-md bg-gray-200 px-3 py-2">
              닫기
            </button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </div>
  );
}
