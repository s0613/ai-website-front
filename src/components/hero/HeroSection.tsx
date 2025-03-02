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
    <div className="flex flex-col md:flex-row gap-4 w-full md:w-10/12 mx-auto">
      {items.map((item, index) => (
        <Card
          key={index}
          className="flex-1 cursor-pointer hover:bg-gray-50 p-4 border border-gray-300 rounded-md"
          onClick={() => onSelect(item)}
        >
          <CardHeader className="p-0 items-center text-center">
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const categories: CategoryItem[] = [
    {
      title: "이미지 생성",
      subtitle: "AI로 이미지 생성하기",
      value: "image-generation"
    },
    {
      title: "영상 생성",
      subtitle: "AI로 영상 생성하기",
      value: "video-generation"
    },
    {
      title: "이미지 레퍼런스",
      subtitle: "AI 이미지 레퍼런스 모음",
      value: "image-reference"
    },
    {
      title: "영상 레퍼런스",
      subtitle: "AI 영상 레퍼런스 모음",
      value: "video-reference"
    }
  ];

  const handleCategorySelect = (item: CategoryItem) => {
    if (item.value === "image-generation") {
      router.push("/image");
    } else if (item.value === "video-generation") {
      router.push("/video");
    } else if (item.value === "image-reference") {
      router.push("/image/reference");
    } else if (item.value === "video-reference") {
      router.push("/video/reference");
    }
  };
  
  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="py-12 md:py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto text-center mb-10 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
          새로운 창조를 경험하세요
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          텍스트로 이미지와 영상을 만들고, 다양한 AI 생성물을 탐색해보세요
        </p>
      </div>

      {/* 검색 영역 */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="상상하는 것을 검색하거나 입력하세요"
            className="w-full h-14 pl-12 pr-4 rounded-full border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-600"
          >
            <FaCamera className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 카테고리 영역 */}
      <CategoryBox items={categories} onSelect={handleCategorySelect} />
    </div>
  );
};

export default HeroSection;
