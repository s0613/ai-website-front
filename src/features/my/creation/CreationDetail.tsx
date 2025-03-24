"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  formatFileSize,
  formatDate,
} from "@/features/reference/video/utils/formatUtils";
import { toast } from "react-hot-toast";

interface CreationDetailProps {
  videoId: number;
  onBack: () => void;
}

interface VideoDetail {
  id: number;
  name: string;
  prompt: string;
  url: string;
  thumbnailUrl: string;
  model: string;
  mode: string;
  createdAt: string;
  shared: boolean;
  clickCount: number;
  likeCount: number;
}

export default function CreationDetail({
  videoId,
  onBack,
}: CreationDetailProps) {
  const router = useRouter();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchVideoDetail = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/my/creation/video/${videoId}`);

        if (!response.ok) {
          throw new Error("작업물을 불러오는데 실패했습니다");
        }

        const data = await response.json();
        setVideo(data.video);
        setIsSharing(data.video.share || false);
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

  // 비디오 재사용 핸들러
  const handleReuseVideo = () => {
    if (!video) return;

    // 필요한 정보를 쿼리 파라미터로 인코딩
    const params = new URLSearchParams({
      prompt: video.prompt || "",
      imageUrl: video.thumbnailUrl || "",
      model: video.model || "luna",
    });

    // 영상 생성 페이지로 이동
    router.push(`/generation/video?${params.toString()}`);
  };

  // 공유 상태 토글 핸들러
  const handleToggleShare = async () => {
    if (!video) return;

    try {
      const response = await fetch(`/api/my/creation/video/toggleShare`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: video.id,
          share: !isSharing,
        }),
      });

      if (!response.ok) {
        throw new Error("공유 상태 변경에 실패했습니다");
      }

      const data = await response.json();

      // API 응답에서 shared 필드를 확인하고 상태 업데이트
      // 응답에 shared 필드가 없을 경우 현재 상태 반전
      const newSharingStatus =
        data.shared !== undefined ? data.shared : !isSharing;

      setIsSharing(newSharingStatus);

      // 성공 메시지 표시
      const status = newSharingStatus ? "공개" : "비공개";
      toast.success(`영상이 ${status}로 설정되었습니다`);

      // 비디오 객체도 업데이트
      setVideo({
        ...video,
        shared: newSharingStatus,
      });
    } catch (err) {
      console.error("Error updating share status:", err);
      toast.error("공유 상태를 변경하는데 실패했습니다");
    }
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
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="bg-white w-full h-full max-h-[85vh] flex flex-col md:flex-row rounded-lg shadow-lg overflow-hidden">
      {/* 왼쪽: 비디오 플레이어 */}
      <div className="md:w-3/5 p-4 bg-black flex items-center justify-center">
        <div className="w-full h-full flex items-center">
          <video
            src={video.url}
            controls
            className="w-full max-h-[70vh] object-contain"
            poster={video.thumbnailUrl}
            autoPlay
          >
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
        </div>
      </div>

      {/* 오른쪽: 비디오 정보 */}
      <div className="md:w-2/5 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{video.name}</h2>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
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
              <h3 className="text-sm font-medium text-gray-500">모델</h3>
              <p className="mt-1">{video.model || "정보 없음"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">모드</h3>
              <p className="mt-1">{video.mode || "정보 없음"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">조회수</h3>
              <p className="mt-1">
                {video.clickCount?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">좋아요</h3>
              <p className="mt-1">{video.likeCount?.toLocaleString() || "0"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">생성일</h3>
              <p className="mt-1">{formatDate(video.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">공유 상태</h3>
              <p className="mt-1">{isSharing ? "공개" : "비공개"}</p>
            </div>
          </div>

          {/* 작업 버튼 영역 */}
          <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            <button
              onClick={handleReuseVideo}
              className="py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              재사용하기
            </button>
            <button
              onClick={handleToggleShare}
              className={`py-3 px-4 ${
                isSharing
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {isSharing ? "비공개로 전환" : "공개로 전환"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
