"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Plus, Loader2, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreationDetail from "./CreationDetail";
import { getUserVideos, getVideosByType } from "../services/MyVideoService";
import { VideoDto } from "../types/Video";

type VideoType = "ALL" | "IMAGE" | "VIDEO" | "TEXT";

export default function CreationPage() {
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<VideoType>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [selectedFilter]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);

      let data: VideoDto[];

      if (selectedFilter === "ALL") {
        data = await getUserVideos();
      } else {
        data = await getVideosByType(selectedFilter.toLowerCase());
      }

      setVideos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("작업물을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoClick = (videoId: number) => {
    setSelectedVideoId(videoId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVideoId(null);
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">내 작업물</h1>
          <p className="text-sm text-gray-400 mt-1">
            생성된 비디오와 이미지를 관리하세요
          </p>
        </div>
        <Link href="/generation/video">
          <Button className="bg-sky-500 hover:bg-sky-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> 새 작업
          </Button>
        </Link>
      </div>

      {/* 필터 영역 */}
      <div className="flex justify-end mb-6">
        <Select
          value={selectedFilter}
          onValueChange={(value) => setSelectedFilter(value as VideoType)}
        >
          <SelectTrigger className="w-[180px] bg-black/40 backdrop-blur-xl border-white/20 text-white">
            <SelectValue placeholder="필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">모든 작업물</SelectItem>
            <SelectItem value="TEXT">텍스트 기반</SelectItem>
            <SelectItem value="IMAGE">이미지 기반</SelectItem>
            <SelectItem value="VIDEO">영상 기반</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-3" />
              <p className="text-gray-400 text-sm">작업물을 불러오는 중...</p>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 p-12 text-center">
            <div className="bg-sky-500/20 text-sky-500 rounded-full p-4 mb-4">
              <Video className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              작업물이 없습니다
            </h3>
            <p className="text-gray-400 mb-5 max-w-md">
              새로운 영상이나 이미지를 생성해보세요!
            </p>
            <Link href="/generation/video">
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                <Plus className="w-4 h-4 mr-2" /> 새 작업 시작하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="overflow-hidden transition-all cursor-pointer bg-black/40 backdrop-blur-xl rounded-lg border border-white/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] hover:bg-black/80 hover:border-white/30 group"
                onClick={() => handleVideoClick(video.id!)}
              >
                <div className="aspect-video bg-black/60 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                    <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <Video className="w-6 h-6 text-sky-500" />
                    </div>
                  </div>
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    poster={
                      video.thumbnailUrl || "/video-thumbnail-placeholder.jpg"
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm line-clamp-1 text-white">
                      {video.name}
                    </h3>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${video.share
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-gray-500/20 text-gray-400"
                        }`}
                    >
                      {video.share ? "공개" : "비공개"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {video.prompt}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {new Date(video.createdAt || "").toLocaleDateString()}
                    </p>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-500/20 rounded-full text-gray-400">
                      {video.model}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 비디오 상세 모달 */}
      {showModal && selectedVideoId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div
            className="w-full max-w-6xl max-h-[90vh] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <CreationDetail videoId={selectedVideoId} onBack={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}
