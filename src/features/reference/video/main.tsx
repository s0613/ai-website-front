"use client";

import { useState, useEffect } from "react";
import Sidebar, { FilterOptions } from "./sidebar";
import VideoDetail from "./videoDetail";

// VideoItem 인터페이스 업데이트
interface VideoItem {
  id: number;
  name: string;
  prompt: string;
  url: string;
  thumbnailUrl: string;
  format: string;
  sizeInBytes: number;
  status: string;
  createdAt: string;
  creator?: string; // creator 필드 추가
  model?: string;
}

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

        // 두 API 요청을 병렬로 실행
        const [adminResponse, sharedResponse] = await Promise.all([
          fetch("/api/admin/video/getAll"),
          fetch("/api/my/creation/video/getSharedVideo"),
        ]);

        // 각 응답 확인 및 데이터 추출
        if (!adminResponse.ok) {
          console.error("관리자 비디오 불러오기 실패:", adminResponse.status);
        }

        if (!sharedResponse.ok) {
          console.error("공유 비디오 불러오기 실패:", sharedResponse.status);
        }

        // 응답 데이터 파싱
        const adminVideos = adminResponse.ok ? await adminResponse.json() : [];
        const sharedVideos = sharedResponse.ok
          ? await sharedResponse.json()
          : [];

        console.log(
          "관리자 비디오:",
          adminVideos.length,
          "공유 비디오:",
          sharedVideos.length
        );

        // ID 기준으로 중복 제거를 위한 Map 사용
        const videoMap = new Map();

        // 관리자 비디오 추가
        adminVideos.forEach((video) => {
          videoMap.set(video.id, {
            ...video,
            creator: "관리자",
          });
        });

        // 공유 비디오 추가 (이미 존재하는 ID의 경우 덮어쓰기)
        sharedVideos.forEach((video) => {
          // 만약 sharedVideos의 구조가 다르다면 여기서 구조를 통일시켜야 함
          if (!videoMap.has(video.id)) {
            videoMap.set(video.id, {
              ...video,
              // video 객체에 필요한 필드가 없다면 기본값 지정
              name: video.name || video.aiVideoName || "제목 없음",
              url: video.url || video.videoUrl || "",
              thumbnailUrl: video.thumbnailUrl || "",
              format: video.format || "mp4",
              sizeInBytes: video.sizeInBytes || 0,
              status: video.status || "완료",
              createdAt: video.createdAt || new Date().toISOString(),
              creator: video.creator || video.email || "사용자", // 생성자 정보 추가
            });
          }
        });

        // Map에서 배열로 변환
        const combinedVideos = Array.from(videoMap.values());

        // 최신순으로 정렬
        combinedVideos.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setVideos(combinedVideos);
        setFilteredVideos(combinedVideos);
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
        filters.categories.includes(getSimpleCategory(video.prompt))
      );
    }
    if (filters.duration !== "모든 길이") {
      filtered = filtered.filter(
        (video) => getSimpleDuration(video.sizeInBytes) === filters.duration
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
                    <p className="text-sm text-gray-500 mt-0.5">
                      {video.creator || "알 수 없음"}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500"></div>
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
      {selectedVideoId && selectedVideo && (
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
              <VideoDetail video={selectedVideo} onBack={handleBackToList} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
