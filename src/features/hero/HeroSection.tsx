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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full mt-4">
      {videoGeneration && (
        <div className="col-span-1 sm:col-span-2 md:col-span-2">
          <Card
            className="cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden group relative border-white/20 bg-black/40 backdrop-blur-xl h-full hover:scale-[1.02] hover:bg-black/80 hover:border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            onClick={() => onSelect(videoGeneration)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
            <CardHeader className="p-5 relative z-10 pb-4 text-center flex flex-col items-center justify-center h-full">
              <CardTitle className="text-xl font-bold text-white group-hover:text-sky-500 transition-colors duration-300">
                {videoGeneration.title}
              </CardTitle>
              <p className="text-sm text-gray-400 mt-2">
                {videoGeneration.subtitle}
              </p>
            </CardHeader>
          </Card>
        </div>
      )}

      {videoReference && (
        <div className="col-span-1">
          <Card
            className="cursor-pointer transition-all h-full duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden group relative border-white/20 bg-black/40 backdrop-blur-xl hover:scale-[1.02] hover:bg-black/80 hover:border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            onClick={() => onSelect(videoReference)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
            <CardHeader className="p-5 relative z-10 pb-5 text-center flex flex-col items-center justify-center h-full">
              <CardTitle className="text-lg font-bold text-white group-hover:text-sky-500 transition-colors duration-300">
                {videoReference.title}
              </CardTitle>
              <p className="text-xs text-gray-400 mt-2">
                {videoReference.subtitle}
              </p>
            </CardHeader>
          </Card>
        </div>
      )}

      {imageItems.map((item, index) => (
        <div key={index} className="col-span-1">
          <Card
            className="cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden group relative border-white/20 bg-black/40 backdrop-blur-xl h-full hover:scale-[1.02] hover:bg-black/80 hover:border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            onClick={() => onSelect(item)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
            <CardHeader className="p-5 relative z-10 pb-5 text-center flex flex-col items-center justify-center h-full">
              <CardTitle className="text-lg font-bold text-white group-hover:text-sky-500 transition-colors duration-300">
                {item.title}
              </CardTitle>
              <p className="text-xs text-gray-400 mt-2">{item.subtitle}</p>
            </CardHeader>
          </Card>
        </div>
      ))}
    </div>
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
    {
      title: "옷 수정",
      subtitle: "이미지 속 옷을 수정해보세요",
      value: "image-edit",
      icon: <Camera className="w-6 h-6" />,
    },
    {
      title: "이미지 업스케일링",
      subtitle: "이미지 해상도를 개선해보세요",
      value: "image-upscaler",
      icon: <Sparkles className="w-5 h-5" />,
    },
  ];

  const handleCategorySelect = (item: CategoryItem) => {
    const routes: Record<string, string> = {
      "image-generation": "/generation/image",
      "video-generation": "/generation/video",
      "image-reference": "/reference/image",
      "video-reference": "/reference/video/main",
      "image-edit": "/image/edit",
      "image-upscaler": "/image/upscaler",
    };
    router.push(routes[item.value]);
  };

  return (
    <div className="py-10 md:py-16 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-left mb-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
            상상을 현실로,{" "}
            <span className="text-sky-500">
              독창적인 AI 영상 제작
            </span>
          </h1>
        </div>

        <CategoryBox items={categories} onSelect={handleCategorySelect} />
      </div>
    </div>
  );
};

export default HeroSection;
