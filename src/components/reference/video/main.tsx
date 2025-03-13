"use client";

import { useState, useEffect } from "react";
import Sidebar, { FilterOptions } from "./sidebar";
import VideoDetail from "./videoDetail";

// VideoItem 인터페이스에 thumbnailUrl 속성 추가
interface VideoItem {
  id: number;
  name: string;
  prompt: string;
  url: string;
  thumbnailUrl: string; // 썸네일 URL 속성 추가
  format: string;
  sizeInBytes: number;
  status: string;
  createdAt: string;
}

// 비디오 길이 카테고리 계산 함수
const getVideoDuration = (sizeInBytes: number): string => {
  // 예시: 사이즈에 따라 대략적인 길이 추정 (실제는 비디오 메타데이터가 필요함)
  const sizeMB = sizeInBytes / (1024 * 1024);
  if (sizeMB < 10) return "짧은 영상";
  if (sizeMB < 50) return "중간 길이";
  return "긴 영상";
};

// 비디오 카테고리 추정 함수 (실제로는 백엔드에서 제공할 것이 좋음)
const getVideoCategory = (prompt: string): string => {
  const promptLower = prompt?.toLowerCase() || "";
  if (promptLower.includes("nature") || promptLower.includes("자연"))
    return "자연";
  if (
    promptLower.includes("city") ||
    promptLower.includes("urban") ||
    promptLower.includes("도시")
  )
    return "도시";
  if (promptLower.includes("abstract") || promptLower.includes("추상"))
    return "추상";
  if (
    promptLower.includes("aerial") ||
    promptLower.includes("drone") ||
    promptLower.includes("항공")
  )
    return "항공";
  if (
    promptLower.includes("cinematic") ||
    promptLower.includes("영화") ||
    promptLower.includes("시네마틱")
  )
    return "시네마틱";
  if (promptLower.includes("slow") || promptLower.includes("슬로우"))
    return "슬로우 모션";
  if (promptLower.includes("documentary") || promptLower.includes("다큐"))
    return "다큐멘터리";
  if (promptLower.includes("experiment") || promptLower.includes("실험"))
    return "실험적";
  return "모든 비디오";
};

// getThumbnailUrl 함수는 대체 URL을 제공하는 용도로만 사용
const getThumbnailUrl = (video: VideoItem): string => {
  // thumbnailUrl이 없는 경우에 대한 대체 로직
  return video.thumbnailUrl || "/images/default-video-thumbnail.jpg";
};

export default function VideoReferencePage() {
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/video/getAll");
        if (!response.ok) {
          throw new Error("비디오 데이터를 불러오는데 실패했습니다");
        }
        const data = await response.json();
        setVideos(data);
        setFilteredVideos(data);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching videos:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...videos];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (video) =>
          video.name.toLowerCase().includes(searchLower) ||
          video.prompt?.toLowerCase().includes(searchLower)
      );
    }
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes("모든 비디오")
    ) {
      filtered = filtered.filter((video) =>
        filters.categories.includes(getVideoCategory(video.prompt))
      );
    }
    if (filters.duration !== "모든 길이") {
      filtered = filtered.filter(
        (video) => getVideoDuration(video.sizeInBytes) === filters.duration
      );
    }
    if (filters.sortBy === "최신순") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (filters.sortBy === "오래된순") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    setFilteredVideos(filtered);
  };

  const handleVideoClick = (videoId: number) => {
    setSelectedVideoId(videoId);
  };

  const handleBackToList = () => {
    setSelectedVideoId(null);
  };

  const handleVideoHover = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      videoElement.play().catch((err) => {
        console.error("비디오 재생 실패:", err);
      });
    }
  };

  const handleVideoLeave = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  };

  const selectedVideo = selectedVideoId
    ? videos.find((v) => v.id === selectedVideoId)
    : null;

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

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-2 text-xl font-medium text-gray-900">
                오류가 발생했습니다
              </h3>
              <p className="mt-1 text-gray-500">{error}</p>
            </div>
          ) : (
            // CSS Columns를 사용하여 테트리스(마젠리) 형식으로 배치
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="mb-4 break-inside-avoid bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => handleVideoClick(video.id)}
                >
                  <div
                    className="relative"
                    onMouseEnter={(e) => {
                      const videoEl = e.currentTarget.querySelector("video");
                      handleVideoHover(videoEl);
                    }}
                    onMouseLeave={(e) => {
                      const videoEl = e.currentTarget.querySelector("video");
                      handleVideoLeave(videoEl);
                    }}
                  >
                    <video
                      src={video.url}
                      poster={video.thumbnailUrl}
                      className="w-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">{video.name}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span>{getVideoCategory(video.prompt)}</span>
                      <span className="mx-2">•</span>
                      <span>{getVideoDuration(video.sizeInBytes)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredVideos.length === 0 && !isLoading && !error && (
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

      {/* 비디오 상세 정보 모달 */}
      {selectedVideoId && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 bg-black/80 p-4"
          onClick={handleBackToList}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl mx-auto"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-gray-800 hover:bg-white shadow-md"
              onClick={handleBackToList}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="h-full overflow-y-auto">
              <VideoDetail
                videoId={selectedVideoId}
                onBack={handleBackToList}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
