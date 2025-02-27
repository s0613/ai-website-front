"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const MyPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] mx-auto">
      {/* 사이드바 - 고정 높이 대신 컨텐츠 높이에 맞게 설정 */}
      <aside className="w-64 bg-gray-100 border-r border-gray-200 shrink-0">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">마이페이지</h2>
          
          {/* 사용자 정보 섹션 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">사용자 정보</h3>
            <ul className="space-y-1">
              <li><button className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">프로필</button></li>
              <li><button className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">설정</button></li>
            </ul>
          </div>
          
          {/* 폴더 섹션 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">폴더</h3>
            <ul className="space-y-1">
              <li><button className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">저장한 이미지</button></li>
              <li><button className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">생성한 이미지</button></li>
              <li><button className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">올린 이미지</button></li>
              <li><button className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">만든 영상</button></li>
              <li><button className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">레퍼런스 영상</button></li>
            </ul>
          </div>
          
          {/* 사용량 섹션 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">사용량</h3>
            <ul className="space-y-1">
              <li><button className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">사용량 보기</button></li>
            </ul>
          </div>
          
          {/* 지갑 섹션 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">지갑</h3>
            <ul className="space-y-1">
              <li><button className="w-full text-left px-2 py-1 hover:bg-gray-200 rounded">지갑 보기</button></li>
            </ul>
          </div>
        </div>
      </aside>
      
      {/* 메인 콘텐츠 영역 - 스크롤 가능하게 설정 */}
      <main className="flex-1 p-6 overflow-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>사용자 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardContent>
        </Card>
        
        {/* 다른 카드들도 동일한 방식으로 수정 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>저장한 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        
        {/* 나머지 카드들... */}
      </main>
    </div>
  );
};

export default MyPage;