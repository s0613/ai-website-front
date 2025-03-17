"use client";

import { useRouter } from "next/navigation";
import { formatFileSize, formatDate } from "@/utils/formatUtils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoDetailProps {
  video: {
    id: number;
    name: string;
    prompt: string;
    url: string;
    thumbnailUrl: string;
    format: string;
    sizeInBytes: number;
    status: string;
    createdAt: string;
    creator?: string;
    model?: string;
  };
  onBack: () => void;
}

// 간단한 내부 유틸리티 함수
const getSimpleCategory = (prompt: string): string => {
  const promptLower = prompt?.toLowerCase() || "";
  if (promptLower.includes("nature") || promptLower.includes("자연"))
    return "자연";
  if (promptLower.includes("city") || promptLower.includes("도시"))
    return "도시";
  return "기타";
};

const getSimpleDuration = (sizeInBytes: number): string => {
  const sizeMB = sizeInBytes / (1024 * 1024);
  if (sizeMB < 10) return "짧은 영상";
  if (sizeMB < 50) return "중간 길이";
  return "긴 영상";
};

export default function VideoDetail({ video, onBack }: VideoDetailProps) {
  const router = useRouter();

  // 비디오 재사용 핸들러
  const handleReuseVideo = () => {
    // 필요한 정보를 쿼리 파라미터로 인코딩
    const params = new URLSearchParams({
      prompt: video.prompt || "",
      imageUrl: video.thumbnailUrl || "",
      model: video.model || "luna",
    });

    // 영상 생성 페이지로 이동
    router.push(`/generation/video?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* 비디오 플레이어 */}
      <div className="md:w-3/5 bg-black flex items-center justify-center p-4">
        <video
          src={video.url}
          poster={video.thumbnailUrl}
          controls
          autoPlay
          className="max-h-[70vh] w-full object-contain"
        >
          브라우저가 비디오 태그를 지원하지 않습니다.
        </video>
      </div>

      {/* 비디오 정보 */}
      <div className="md:w-2/5 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{video.name}</h2>
        <p className="text-gray-600 mb-4">{video.creator || "알 수 없음"}</p>

        <div className="space-y-4">
          {/* 프롬프트 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">프롬프트</h3>
            <ScrollArea className="h-[120px]">
              <p className="text-gray-700 pr-4">
                {video.prompt || "프롬프트 정보가 없습니다."}
              </p>
            </ScrollArea>
          </div>

          {/* 메타데이터 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            {video.model && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">모델</h3>
                <p className="mt-1">{video.model}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">유형</h3>
              <p className="mt-1">{getSimpleCategory(video.prompt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">포맷</h3>
              <p className="mt-1">{video.format || "MP4"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">파일 크기</h3>
              <p className="mt-1">{formatFileSize(video.sizeInBytes)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">생성일</h3>
              <p className="mt-1">{formatDate(video.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">길이</h3>
              <p className="mt-1">{getSimpleDuration(video.sizeInBytes)}</p>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="pt-4 grid grid-cols-2 gap-4">
            <button
              onClick={handleReuseVideo}
              className="py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              재사용하기
            </button>
            <button
              onClick={onBack}
              className="py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
