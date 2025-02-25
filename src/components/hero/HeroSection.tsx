"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { FaCamera } from "react-icons/fa";

// Shadcn UI Card 컴포넌트 불러오기 (설치/설정 후 사용하세요)
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";

type CategoryItem = {
  title: string;
  subtitle: string;
  value: string; // 백엔드에서 사용할 카테고리 값
};

const CategoryBox = ({
  items,
  onSelect,
}: {
  items: CategoryItem[];
  onSelect: (item: CategoryItem) => void;
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full md:w-10/12">
      {items.map((item, index) => (
        <Card
          key={index}
          className="flex-1 cursor-pointer hover:bg-gray-50 p-4 border border-gray-300 rounded-md min-h-[200px]"
          onClick={() => onSelect(item)}
        >
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold text-gray-800 mb-1">
              {item.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {item.subtitle}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // 검색 요청 처리
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/gallery/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  // 카테고리 선택 처리
  const handleCategorySelect = (item: CategoryItem) => {
  // "AI 영상 생성" 선택 시, /video 페이지로 이동
  if (item.value === "VIDEO") {
    router.push("/video");
  } else {
    router.push(`/gallery/search?category=${encodeURIComponent(item.value)}`);
  }
};

  // 카테고리 항목 정의
  const categoryItems: CategoryItem[] = [
    {
      title: "AI 영상 생성",
      subtitle: "아름다운 영상 제작의 시작",
      value: "VIDEO",
    },
    {
      title: "AI 이미지 생성",
      subtitle: "더 현실적으로, 현실보다 더 현실같게",
      value: "REALITY",
    },
  ];

  return (
    <section className="bg-white text-black px-4 pt-3 pb-12 md:px-16 md:pt-6 md:pb-14">
      {/* min-h-screen: 화면 높이만큼 차지, items-center + justify-center로 중앙 정렬 */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* 좌측(PC 전용) 영역 */}
        <div className="hidden md:flex flex-1 flex-col text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold mt-8 md:mt-16 mb-4 leading-tight">
            Crazy Space
          </h1>
          <p className="text-base md:text-lg font-light text-gray-700 mb-6 leading-relaxed">
            Crazy Space에서 모든 상상을 현실로 만나보세요.
            <br />
            모든 AI 이미지와 영상을 만나보세요.
          </p>
          {/* 검색창 */}
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="사진과 일러스트 검색"
              className="w-full h-14 border border-gray-300 rounded-md px-4 pl-10 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <FaCamera className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          </form>
        </div>

        {/* 공통 Category Box 영역 */}
        <div className="flex-1 flex justify-center items-center">
          <CategoryBox items={categoryItems} onSelect={handleCategorySelect} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
