"use client";

import { useState, useEffect } from "react";
import Sidebar, { FilterOptions } from "./sidebar";

// 샘플 데이터 - 실제 데이터로 대체 필요
interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
  duration: string;
  date: string;
}

const sampleVideos: VideoItem[] = [
  {
    id: "1",
    title: "Nature Time Lapse",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    videoUrl: "#",
    category: "자연",
    duration: "짧은 영상",
    date: "2023-05-15",
  },
  {
    id: "2",
    title: "Urban Landscapes",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    videoUrl: "#",
    category: "도시",
    duration: "중간 길이",
    date: "2023-06-20",
  },
  {
    id: "3",
    title: "Abstract Motion",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    videoUrl: "#",
    category: "추상",
    duration: "긴 영상",
    date: "2023-04-12",
  },
  {
    id: "4",
    title: "Aerial Photography",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    videoUrl: "#",
    category: "항공",
    duration: "짧은 영상",
    date: "2023-05-15",
  },
  {
    id: "5",
    title: "Cinematic Shots",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    videoUrl: "#",
    category: "시네마틱",
    duration: "중간 길이",
    date: "2023-06-20",
  },
  {
    id: "6",
    title: "Slow Motion",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    videoUrl: "#",
    category: "슬로우 모션",
    duration: "긴 영상",
    date: "2023-04-12",
  },
  {
    id: "7",
    title: "Documentary Style",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    videoUrl: "#",
    category: "다큐멘터리",
    duration: "짧은 영상",
    date: "2023-05-15",
  },
  {
    id: "8",
    title: "Experimental",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    videoUrl: "#",
    category: "실험적",
    duration: "긴 영상",
    date: "2023-04-12",
  },
];

export default function VideoReferencePage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>(sampleVideos);
  const [filteredVideos, setFilteredVideos] =
    useState<VideoItem[]>(sampleVideos);

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...videos];

    // 검색어로 필터링
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(searchLower)
      );
    }

    // 카테고리로 필터링
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes("모든 비디오")
    ) {
      filtered = filtered.filter((video) =>
        filters.categories.includes(video.category)
      );
    }

    // 길이로 필터링
    if (filters.duration !== "모든 길이") {
      filtered = filtered.filter(
        (video) => video.duration === filters.duration
      );
    }

    // 정렬
    if (filters.sortBy === "최신순") {
      filtered = filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (filters.sortBy === "오래된순") {
      filtered = filtered.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
    // 인기순은 실제 데이터가 없으므로 생략

    setFilteredVideos(filtered);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onFilterChange={handleFilterChange} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">비디오 레퍼런스</h1>
            <p className="text-lg text-gray-600">
              크리에이티브 작업을 위한 영감
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="overflow-hidden rounded-lg bg-white shadow-sm cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative w-full pt-[56.25%]">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-base font-medium">
                      {video.title}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{video.title}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span>{video.category}</span>
                    <span className="mx-2">•</span>
                    <span>{video.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-xl font-medium text-gray-900">
                검색 결과가 없습니다
              </h3>
              <p className="mt-1 text-gray-500">
                다른 검색어나 필터를 시도해보세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 overflow-y-auto p-8"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative bg-white max-w-4xl w-full rounded-lg p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-3xl bg-transparent border-none cursor-pointer text-gray-700"
              onClick={() => setSelectedVideo(null)}
            >
              ×
            </button>
            <h2 className="text-2xl font-semibold">{selectedVideo.title}</h2>
            <div className="flex items-center text-sm text-gray-500 mt-1 mb-4">
              <span>{selectedVideo.category}</span>
              <span className="mx-2">•</span>
              <span>{selectedVideo.duration}</span>
            </div>
            <div className="mt-4 w-full">
              <img
                src={selectedVideo.thumbnailUrl}
                alt={selectedVideo.title}
                className="w-full h-auto rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
