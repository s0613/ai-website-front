"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Camera, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 모든 요소에 적용할 공통 애니메이션
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.2 },
};

type CategoryItem = {
  title: string;
  subtitle: string;
  value: string;
  icon: React.ReactNode;
};

const CategoryBox = ({
  items,
  onSelect,
}: {
  items: CategoryItem[];
  onSelect: (item: CategoryItem) => void;
}) => {
  return (
    <motion.div
      {...fadeIn}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-6xl mx-auto"
    >
      {items.map((item, index) => (
        <motion.div key={index} {...fadeIn}>
          <Card
            className="cursor-pointer transition-all duration-500 hover:shadow-xl border border-gray-200 overflow-hidden group relative bg-white"
            onClick={() => onSelect(item)}
          >
            <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -translate-y-8 translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>
            <CardHeader className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-sky-500 transform group-hover:scale-110 transition-transform duration-500 ease-out"
                >
                  {item.icon}
                </motion.div>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:translate-x-1 transition-transform duration-500">
                {item.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 group-hover:translate-x-1 transition-transform duration-700 delay-75">
                {item.subtitle}
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

const HeroSection = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const categories: CategoryItem[] = [
    {
      title: "시각적 창작",
      subtitle: "전문가급 AI 이미지 제작 솔루션",
      value: "image-generation",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      title: "영상 스튜디오",
      subtitle: "신뢰할 수 있는 AI 영상 제작 플랫폼",
      value: "video-generation",
      icon: <Camera className="w-5 h-5" />,
    },
    {
      title: "영감의 갤러리",
      subtitle: "엄선된 AI 이미지 컬렉션",
      value: "image-reference",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      title: "영상 마에스트로",
      subtitle: "혁신적인 AI 영상 작품 모음",
      value: "video-reference",
      icon: <Camera className="w-5 h-5" />,
    },
  ];

  const handleCategorySelect = (item: CategoryItem) => {
    if (item.value === "image-generation") {
      router.push("/generation/image");
    } else if (item.value === "video-generation") {
      router.push("/generation/video");
    } else if (item.value === "image-reference") {
      router.push("/reference/image");
    } else if (item.value === "video-reference") {
      router.push("/reference/video/main");
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
    <motion.div
      {...fadeIn}
      className="py-20 md:py-28 px-4 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200"
    >
      <div className="max-w-6xl mx-auto text-center mb-16 md:mb-20">
        <motion.div
          {...fadeIn}
          className="inline-block mb-5 px-5 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm font-medium backdrop-blur-sm border border-gray-200/50"
        >
          신뢰할 수 있는 AI 영상 제작 플랫폼
        </motion.div>
        <motion.h1
          {...fadeIn}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8"
        >
          상상을 현실로,{" "}
          <motion.span {...fadeIn} className="text-sky-500">
            전문가급 영상 제작
          </motion.span>
        </motion.h1>
        <motion.p
          {...fadeIn}
          className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
        >
          검증된 AI 기술로 구현하는 창의적인 영상 콘텐츠. 전문가의 손길이 닿은
          듯한 퀄리티를 경험하세요.
        </motion.p>
      </div>

      {/* 검색 영역 */}
      <motion.div {...fadeIn} className="max-w-2xl mx-auto mb-20">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <motion.div
              {...fadeIn}
              className="absolute left-4 text-gray-500 z-10"
            >
              <Search className="w-5 h-5 stroke-2" />
            </motion.div>
            <motion.div {...fadeIn} className="w-full">
              <Input
                type="text"
                placeholder="원하는 영상 콘셉트를 입력하세요"
                className="w-full h-14 pl-12 pr-20 rounded-full border border-gray-300 bg-white/90 backdrop-blur-sm text-gray-800 focus:ring-2 focus:ring-sky-200 shadow-sm transition-all duration-300 focus:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
            <motion.div
              {...fadeIn}
              className="absolute right-2 overflow-hidden rounded-full"
            >
              <Button
                type="submit"
                className="h-10 w-10 flex items-center justify-center bg-sky-500 hover:bg-sky-600 transition-all duration-500 relative group"
              >
                <Camera className="w-4 h-4 relative z-10 transform group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-0 group-hover:scale-100 rounded-full"></div>
              </Button>
            </motion.div>
          </div>
        </form>
      </motion.div>

      {/* 카테고리 영역 */}
      <CategoryBox items={categories} onSelect={handleCategorySelect} />

      {/* 신뢰성 배지 */}
      <motion.div
        {...fadeIn}
        className="flex flex-wrap justify-center gap-6 mt-20 max-w-4xl mx-auto"
      >
        {[
          "99.9% 가용성",
          "전문가 검증 알고리즘",
          "엔터프라이즈급 보안",
          "독창적 콘텐츠 보장",
        ].map((text, index) => (
          <motion.div
            key={index}
            {...fadeIn}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="w-2 h-2 rounded-full bg-sky-400"
            ></motion.div>
            <span className="text-sm font-medium text-gray-800">{text}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default HeroSection;
