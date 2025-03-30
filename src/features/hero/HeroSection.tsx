"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { Camera, Sparkles, Video } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

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
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full mt-4"
    >
      {videoGeneration && (
        <motion.div
          {...fadeIn}
          className="col-span-1 sm:col-span-2 md:col-span-2"
        >
          <Card
            className="cursor-pointer transition-all duration-500 hover:shadow-xl overflow-hidden group relative border-sky-400 bg-gradient-to-br from-white to-sky-50 h-full"
            onClick={() => onSelect(videoGeneration)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-sky-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-in-out" />
            <CardHeader className="p-5 relative z-10 pb-4 text-center flex flex-col items-center justify-center h-full">
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-sky-700 transition-colors duration-300">
                {videoGeneration.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {videoGeneration.subtitle}
              </p>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      {videoReference && (
        <motion.div {...fadeIn} className="col-span-1">
          <Card
            className="cursor-pointer transition-all h-full duration-500 hover:shadow-xl overflow-hidden group relative border-gray-200 bg-white"
            onClick={() => onSelect(videoReference)}
          >
            <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-in-out" />
            <CardHeader className="p-5 relative z-10 pb-5 text-center flex flex-col items-center justify-center h-full">
              <CardTitle className="text-lg font-bold text-gray-900 group-hover:translate-y-1 transition-transform duration-500">
                {videoReference.title}
              </CardTitle>
              <p className="text-xs text-gray-600 mt-2">
                {videoReference.subtitle}
              </p>
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
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-in-out" />
            <CardHeader className="p-5 relative z-10 pb-5 text-center flex flex-col items-center justify-center h-full">
              <CardTitle className="text-lg font-bold text-gray-900 group-hover:translate-y-1 transition-transform duration-500">
                {item.title}
              </CardTitle>
              <p className="text-xs text-gray-600 mt-2">{item.subtitle}</p>
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
      title: "AI 영상 제작",
      subtitle: "나만의 영상을 손쉽게 만들어보세요",
      value: "video-generation",
      icon: <Video className="w-7 h-7" />,
    },
    {
      title: "영상 갤러리",
      subtitle: "고품질 영상 모음집",
      value: "video-reference",
      icon: <Camera className="w-6 h-6" />,
    },
    {
      title: "이미지 갤러리",
      subtitle: "AI 생성 이미지 모음",
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
      className="py-10 md:py-16 px-4 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-left mb-3">
          <motion.h1
            {...fadeIn}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
          >
            상상을 현실로,{" "}
            <motion.span {...fadeIn} className="text-sky-500">
              독창적인 AI 영상 제작
            </motion.span>
          </motion.h1>
        </div>

        <CategoryBox items={categories} onSelect={handleCategorySelect} />
      </div>
    </motion.div>
  );
};

export default HeroSection;
