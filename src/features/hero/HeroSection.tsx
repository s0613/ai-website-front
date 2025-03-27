"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { Camera, Sparkles, Video, Play } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const videoGeneration = items.find(
    (item) => item.value === "video-generation"
  );
  const videoReference = items.find((item) => item.value === "video-reference");
  const imageItems = items.filter((item) => item.value.includes("image"));

  return (
    <motion.div
      {...fadeIn}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full max-w-6xl mx-auto mt-10"
    >
      {videoGeneration && (
        <motion.div {...fadeIn} className="col-span-1">
          <Card
            className="cursor-pointer transition-all duration-500 hover:shadow-xl overflow-hidden group relative border-sky-300 bg-gradient-to-br from-white to-sky-50 h-full"
            onClick={() => onSelect(videoGeneration)}
          >
            <div className="absolute inset-0 bg-sky-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-16 h-16 bg-sky-100 rounded-bl-full -translate-y-6 translate-x-6 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-700 ease-in-out" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-sky-500 text-white font-semibold">
                추천
              </Badge>
            </div>
            <CardHeader className="p-5 relative z-10 pb-5">
              <div className="flex items-center justify-between mb-2">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-100 text-sky-600 transform group-hover:scale-110 transition-transform duration-500 ease-out"
                >
                  {videoGeneration.icon}
                </motion.div>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900 mb-1 group-hover:translate-x-1 transition-transform duration-500">
                {videoGeneration.title}
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 group-hover:translate-x-1 transition-transform duration-700 delay-75 mb-3">
                {videoGeneration.subtitle}
              </CardDescription>
              <Button
                variant="ghost"
                className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 p-0 h-auto font-medium text-xs mt-2"
                size="sm"
              >
                바로 시작하기 <Play className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      {videoReference && (
        <motion.div {...fadeIn} className="col-span-1">
          <Card
            className="cursor-pointer transition-all h-full duration-500 hover:shadow-xl overflow-hidden group relative border-sky-300 bg-gradient-to-br from-white to-sky-50"
            onClick={() => onSelect(videoReference)}
          >
            <div className="absolute inset-0 bg-sky-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-16 h-16 bg-sky-100 rounded-bl-full -translate-y-6 translate-x-6 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-700 ease-in-out" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-sky-500 text-white font-semibold">
                추천
              </Badge>
            </div>
            <CardHeader className="p-5 relative z-10 pb-5">
              <div className="flex items-center justify-between mb-2">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-100 text-sky-600 transform group-hover:scale-110 transition-transform duration-500 ease-out"
                >
                  {videoReference.icon}
                </motion.div>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900 mb-1 group-hover:translate-x-1 transition-transform duration-500">
                {videoReference.title}
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 group-hover:translate-x-1 transition-transform duration-700 delay-75 mb-3">
                {videoReference.subtitle}
              </CardDescription>
              <Button
                variant="ghost"
                className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 p-0 h-auto font-medium text-xs mt-2"
                size="sm"
              >
                바로 시작하기 <Play className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      {imageItems.map((item, index) => (
        <motion.div key={index} {...fadeIn} className="col-span-1">
          <Card
            className="cursor-pointer transition-all duration-500 hover:shadow-xl overflow-hidden group relative border border-gray-200 bg-white h-full"
            onClick={() => onSelect(item)}
          >
            <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-16 h-16 bg-sky-50 rounded-bl-full -translate-y-6 translate-x-6 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-700 ease-in-out" />
            <CardHeader className="p-5 relative z-10 pb-5">
              <div className="flex items-center justify-between mb-2">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-sky-500 transform group-hover:scale-110 transition-transform duration-500 ease-out"
                >
                  {item.icon}
                </motion.div>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900 mb-1 group-hover:translate-x-1 transition-transform duration-500">
                {item.title}
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 group-hover:translate-x-1 transition-transform duration-700 delay-75 mb-3">
                {item.subtitle}
              </CardDescription>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-0 h-auto font-medium text-xs mt-2"
                size="sm"
              >
                바로 시작하기 <Play className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

const HeroSection = () => {
  const router = useRouter();

  const categories: CategoryItem[] = [
    {
      title: "프리미엄 영상 스튜디오",
      subtitle: "AI 기반 전문가급 영상 제작 시스템",
      value: "video-generation",
      icon: <Video className="w-6 h-6" />,
    },
    {
      title: "영상 마에스트로 갤러리",
      subtitle: "엄선된 고품질 AI 영상 컬렉션 & 트렌드",
      value: "video-reference",
      icon: <Camera className="w-6 h-6" />,
    },
    {
      title: "이미지 크리에이터",
      subtitle: "AI 이미지 제작 솔루션",
      value: "image-generation",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      title: "영감의 갤러리",
      subtitle: "AI 이미지 컬렉션",
      value: "image-reference",
      icon: <Sparkles className="w-5 h-5" />,
    },
  ];

  const handleCategorySelect = (item: CategoryItem) => {
    const routes: Record<string, string> = {
      "image-generation": "/generation/image",
      "video-generation": "/generation/video",
      "image-reference": "/reference/image",
      "video-reference": "/reference/video/main",
    };
    router.push(routes[item.value]);
  };

  return (
    <motion.div
      {...fadeIn}
      className="py-20 md:py-28 px-4 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200"
    >
      <div className="max-w-6xl mx-auto text-center mb-10">
        <motion.h1
          {...fadeIn}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-12"
        >
          상상을 현실로,{" "}
          <motion.span {...fadeIn} className="text-sky-500">
            독창적인 AI 영상 제작
          </motion.span>
        </motion.h1>
      </div>

      <CategoryBox items={categories} onSelect={handleCategorySelect} />
    </motion.div>
  );
};

export default HeroSection;
