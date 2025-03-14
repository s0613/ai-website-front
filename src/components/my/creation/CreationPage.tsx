"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Plus, Filter } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Video {
  id: number;
  videoUrl: string;
  thumbnailUrl: string;
  aiVideoName: string;
  prompt: string;
  model: string;
  mode: string;
  createdAt: string;
  share: boolean;
}

// 비디오 타입 정의
type VideoType = "ALL" | "IMAGE" | "VIDEO" | "TEXT";

export default function CreationPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<VideoType>("ALL");

  useEffect(() => {
    fetchVideos(selectedType);
  }, [selectedType]);

  const fetchVideos = async (type: VideoType) => {
    try {
      setLoading(true);
      let res;

      // 타입에 따라 다른 API 호출
      if (type === "ALL") {
        res = await fetch("/api/my/creation/video/getUserVideos");
      } else {
        res = await fetch(`/api/my/creation/video/typeGet?type=${type}`);
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "비디오를 가져오는데 실패했습니다"
        );
      }

      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error("비디오 로딩 중 오류:", err);
      toast.error("비디오 목록을 불러오는데 실패했습니다");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleShare = async (id: number, currentShare: boolean) => {
    try {
      const res = await fetch("/api/my/creation/video/toggleShare", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, share: !currentShare }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "공유 상태 변경에 실패했습니다");
      }

      setVideos(
        videos.map((video) =>
          video.id === id ? { ...video, share: !video.share } : video
        )
      );
      toast.success(
        `비디오가 ${
          !currentShare ? "공유되었습니다" : "비공개로 설정되었습니다"
        }`
      );
    } catch (err) {
      console.error("공유 상태 변경 실패:", err);
      toast.error("공유 상태를 변경하는데 실패했습니다");
    }
  };

  // 타입 선택 변경 핸들러
  const handleTypeChange = (value: string) => {
    setSelectedType(value as VideoType);
  };

  return (
    <div className="p-6">
      {/* 헤더: 페이지 이름만 (뒤로가기 버튼 제거) */}
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">내 생성 비디오</h1>
      </div>

      {/* 필터 및 액션 버튼 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="비디오 타입 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">모든 비디오</SelectItem>
              <SelectItem value="IMAGE">이미지 기반</SelectItem>
              <SelectItem value="VIDEO">비디오 기반</SelectItem>
              <SelectItem value="TEXT">텍스트 기반</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/video/generation">
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />새 비디오 생성
          </Button>
        </Link>
      </div>

      {/* 로딩 상태 */}
      {loading ? (
        <div className="flex justify-center items-center p-12 bg-white rounded-lg">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
          <p>
            {selectedType === "ALL"
              ? "영상"
              : selectedType === "IMAGE"
              ? "이미지 기반 영상"
              : selectedType === "VIDEO"
              ? "비디오 기반 영상"
              : "텍스트 기반 영상"}{" "}
            불러오는 중...
          </p>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="border rounded-lg overflow-hidden hover:border-blue-500 transition-all bg-white"
            >
              <div className="aspect-video relative">
                <video
                  src={video.videoUrl}
                  className="w-full h-full object-cover"
                  poster={video.thumbnailUrl || undefined}
                  controls
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">
                  {video.aiVideoName}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {video.prompt}
                </p>
                <div className="flex gap-2 mb-2">
                  <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {video.model}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {video.mode}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  생성일: {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${
                    video.share
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => toggleShare(video.id, video.share)}
                >
                  {video.share ? "공유 중" : "공유하기"}
                </Button>
                <a
                  href={video.videoUrl}
                  download={video.aiVideoName}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  다운로드
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-white rounded-lg shadow">
          <Video className="h-12 w-12 mb-3" />
          {selectedType === "ALL" ? (
            <p className="mb-4">생성된 비디오가 없습니다</p>
          ) : (
            <p className="mb-4">
              {selectedType === "IMAGE"
                ? "이미지"
                : selectedType === "VIDEO"
                ? "비디오"
                : "텍스트"}{" "}
              기반 비디오가 없습니다
            </p>
          )}
          <Link href="/video/generation">
            <Button>비디오 생성하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
