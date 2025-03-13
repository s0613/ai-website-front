"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { formatFileSize, formatDate } from "@/utils/formatUtils";

interface VideoDetailProps {
  videoId: number;
  onBack: () => void;
}

interface VideoDetail {
  id: number;
  name: string;
  prompt: string;
  url: string;
  format: string;
  sizeInBytes: number;
  status: string;
  createdAt: string;
}

export default function VideoDetail({ videoId, onBack }: VideoDetailProps) {
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoDetail = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/video/${videoId}`);

        if (!response.ok) {
          throw new Error("비디오를 불러오는데 실패했습니다");
        }

        const data = await response.json();
        setVideo(data);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching video:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetail();
    }
  }, [videoId]);

  // 비디오 사용 핸들러 함수
  const handleUseVideo = () => {
    // 여기에 비디오를 사용하는 로직 추가
    // 예: 복사, 다운로드, 다른 페이지로 리디렉션 등
    alert(`비디오 "${video?.name}"를 사용합니다`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-red-500 text-xl mb-4">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="bg-white w-full h-full max-h-[85vh] flex flex-col md:flex-row">
      {/* 왼쪽: 비디오 플레이어 */}
      <div className="md:w-3/5 p-4 bg-black flex items-center justify-center">
        <div className="w-full h-full flex items-center">
          <video
            src={video.url}
            controls
            className="w-full max-h-[70vh] object-contain"
            poster="/video-thumbnail-placeholder.jpg"
            autoPlay
          >
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
        </div>
      </div>

      {/* 오른쪽: 비디오 정보 */}
      <div className="md:w-2/5 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{video.name}</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">프롬프트</h3>
            <p className="text-gray-700">
              {video.prompt || "프롬프트 정보가 없습니다."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">포맷</h3>
              <p className="mt-1">{video.format}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">파일 크기</h3>
              <p className="mt-1">{formatFileSize(video.sizeInBytes)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">상태</h3>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    video.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : video.status === "PROCESSING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {video.status === "COMPLETED"
                    ? "완료"
                    : video.status === "PROCESSING"
                    ? "처리중"
                    : video.status}
                </span>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">생성일</h3>
              <p className="mt-1">{formatDate(video.createdAt)}</p>
            </div>
          </div>

          {/* 비디오 ID 부분 대신 USE 버튼 추가 */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleUseVideo}
              className="w-full py-3 px-4 bg-black hover:bg-black text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              USE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
