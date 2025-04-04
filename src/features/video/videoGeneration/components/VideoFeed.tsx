"use client";

import React, { useEffect, useState, useRef } from "react";
import { VideoDto } from "../../types/Video";
import { getSharedVideosNoLogin } from "../../services/MyVideoService";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function VideoFeed() {
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const fetchedVideos = await getSharedVideosNoLogin();
        setVideos(fetchedVideos);
      } catch (error) {
        toast({
          title: "비디오 로딩 실패",
          description: "비디오를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [toast]);

  // 비디오 종료 시 다음 비디오로 자동 전환
  const handleVideoEnded = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // 마지막 비디오면 처음으로 돌아가기
    }
  };

  // 이전 비디오로 이동
  const handlePrevVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(videos.length - 1); // 첫 번째 비디오면 마지막으로 이동
    }
  };

  // 다음 비디오로 이동
  const handleNextVideo = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // 마지막 비디오면 처음으로 이동
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl mb-4 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <p className="text-gray-400">공유된 비디오가 없습니다.</p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        src={currentVideo.url}
        className="h-full w-full object-contain"
        loop={false}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
      />

      {/* 비디오 정보 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-lg font-semibold">{currentVideo.name}</h3>
            <p className="text-sm text-gray-300">{currentVideo.prompt}</p>
          </div>
          <div className="flex gap-4">
            <button className="flex flex-col items-center text-white hover:text-sky-500 transition-colors duration-300">
              <Heart className="w-6 h-6" />
              <span className="text-xs">{currentVideo.likeCount || 0}</span>
            </button>
            <button className="flex flex-col items-center text-white hover:text-sky-500 transition-colors duration-300">
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex flex-col items-center text-white hover:text-sky-500 transition-colors duration-300">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
        <button
          onClick={handlePrevVideo}
          className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 text-white transition-colors border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={handleNextVideo}
          className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 text-white transition-colors border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
