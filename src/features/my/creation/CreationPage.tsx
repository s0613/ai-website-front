"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Plus } from "lucide-react";
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

interface Video {
  id: number;
  videoUrl: string;
  thumbnailUrl: string;
  name: string;
  prompt: string;
  model: string;
  mode: string;
  createdAt: string;
  share: boolean;
}

type VideoType = "ALL" | "IMAGE" | "VIDEO" | "TEXT";

export default function CreationPage() {
  const [videos, setVideos] = useState<Video[]>([]);
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
      let url = "/api/my/creation/video/getUserVideos";

      if (selectedFilter !== "ALL") {
        // URL에 직접 타입을 포함시킴
        url = `/api/my/creation/video/typeGet/${selectedFilter.toLowerCase()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">내 작업물</h1>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedFilter}
            onValueChange={(value) => setSelectedFilter(value as VideoType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">모든 작업물</SelectItem>
              <SelectItem value="TEXT">텍스트 기반</SelectItem>
              <SelectItem value="IMAGE">이미지 기반</SelectItem>
              <SelectItem value="VIDEO">영상 기반</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/generation/video">
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" /> 새 작업
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Video className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            작업물이 없습니다
          </h3>
          <p className="text-gray-500 mb-4">새로운 영상을 생성해보세요!</p>
          <Link href="/generation/video">
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" /> 새 작업 시작하기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="overflow-hidden hover:shadow-sm transition-all cursor-pointer bg-white rounded-md"
              onClick={() => handleVideoClick(video.id)}
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <video
                  src={video.videoUrl}
                  className="w-full h-full object-cover"
                  poster={
                    video.thumbnailUrl || "/video-thumbnail-placeholder.jpg"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30"></div>
              </div>
              <div className="p-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm line-clamp-1">
                    {video.name}
                  </h3>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      video.share
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {video.share ? "공개" : "비공개"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {video.prompt}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 비디오 상세 모달 */}
      {showModal && selectedVideoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[90vh]">
            <CreationDetail videoId={selectedVideoId} onBack={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}
