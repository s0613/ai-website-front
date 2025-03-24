"use client";

import { useRouter } from "next/navigation";
import { formatFileSize, formatDate } from "./utils/formatUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

// 기본 비디오 정보 인터페이스
interface VideoBasicInfo {
  id: number;
  name: string;
  thumbnailUrl: string;
  creator: string;
}

// 상세 비디오 정보 인터페이스 - clickCount와 likeCount 추가
interface VideoDetailInfo {
  title?: string;
  creator?: string;
  thumbnailUrl?: string;
  prompt?: string;
  url?: string;
  format?: string;
  sizeInBytes?: number;
  status?: string;
  createdAt?: string;
  model?: string;
  clickCount?: number;
  likeCount?: number;
  liked?: boolean;
}

interface VideoDetailProps {
  videoId: number;
  videoBasicInfo: VideoBasicInfo;
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

export default function VideoDetail({
  videoId,
  videoBasicInfo,
  onBack,
}: VideoDetailProps) {
  const router = useRouter();
  const [videoDetail, setVideoDetail] = useState<VideoDetailInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 비디오 상세 정보를 API를 통해 가져오기
  useEffect(() => {
    const fetchVideoDetail = async () => {
      try {
        setIsLoading(true);
        // route.ts API를 통해 상세 정보 요청
        const response = await fetch(`/api/my/creation/video/${videoId}`);

        if (!response.ok) {
          throw new Error("비디오 상세 정보를 가져오는데 실패했습니다.");
        }

        const data = await response.json();
        console.log("비디오 상세 정보:", data);

        if (data.success && data.video) {
          setVideoDetail(data.video);
          setLikeCount(data.video.likeCount || 0);

          // 좋아요 상태 설정 - 서버에서 liked 필드 확인
          if (data.video.liked !== undefined) {
            setIsLiked(data.video.liked);
          }
        } else {
          // API 응답에 데이터가 없으면 기본 정보만 사용
          setVideoDetail({
            title: videoBasicInfo.name,
            creator: videoBasicInfo.creator,
            thumbnailUrl: videoBasicInfo.thumbnailUrl,
            clickCount: 0,
            likeCount: 0,
          });
          setLikeCount(0);
          setIsLiked(false); // 기본값은 좋아요 안 누름 상태
        }
      } catch (err) {
        console.error("비디오 상세 정보 조회 오류:", err);
        setError((err as Error).message);
        // 오류 발생 시 기본 정보 사용
        setVideoDetail({
          title: videoBasicInfo.name,
          creator: videoBasicInfo.creator,
          thumbnailUrl: videoBasicInfo.thumbnailUrl,
          clickCount: 0,
          likeCount: 0,
        });
        setLikeCount(0);
        setIsLiked(false); // 오류 발생 시에도 좋아요 안 누름 상태로 설정
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoDetail();
  }, [videoId, videoBasicInfo]);

  // 비디오 재사용 핸들러
  const handleReuseVideo = () => {
    // 프롬프트가 있으면 사용, 없으면 제목 사용
    const prompt = videoDetail?.prompt || videoBasicInfo.name;

    // 필요한 정보를 쿼리 파라미터로 인코딩
    const params = new URLSearchParams({
      prompt: prompt,
      imageUrl: videoBasicInfo.thumbnailUrl || "",
      model: videoDetail?.model || "luna",
    });

    // 영상 생성 페이지로 이동
    router.push(`/generation/video?${params.toString()}`);
  };

  // 좋아요 버튼 핸들러
  const handleLikeClick = async () => {
    // 좋아요 상태 토글
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    // 좋아요 수 업데이트 (UI 즉시 반영)
    setLikeCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      // 좋아요 상태 업데이트 API 요청
      const response = await fetch("/api/my/creation/video/updateLike", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: videoId,
          like: newLikedState,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "좋아요 업데이트에 실패했습니다");
      }

      const data = await response.json();
      console.log("좋아요 업데이트 성공:", data);

      // API 응답에서 받은 좋아요 수로 업데이트 (백엔드 데이터 기준)
      if (data.likeCount !== undefined) {
        setLikeCount(data.likeCount);
      }

      console.log(`좋아요 ${newLikedState ? "추가" : "취소"} 성공`);
    } catch (err) {
      console.error("좋아요 처리 중 오류:", err);
      // 오류 발생 시 상태 복원
      setIsLiked(!newLikedState);
      setLikeCount((prev) =>
        !newLikedState ? prev + 1 : Math.max(0, prev - 1)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* 비디오 플레이어 */}
      <div className="md:w-3/5 bg-black flex items-center justify-center p-4">
        {videoDetail?.url ? (
          <video
            src={videoDetail.url}
            poster={videoDetail.thumbnailUrl || videoBasicInfo.thumbnailUrl}
            controls
            autoPlay
            className="max-h-[70vh] w-full object-contain"
          >
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
        ) : (
          // 비디오 URL이 없으면 썸네일만 표시
          <img
            src={videoDetail?.thumbnailUrl || videoBasicInfo.thumbnailUrl}
            alt={videoDetail?.title || videoBasicInfo.name}
            className="max-h-[70vh] w-full object-contain"
          />
        )}
      </div>

      {/* 비디오 정보 */}
      <div className="md:w-2/5 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {videoDetail?.title || videoBasicInfo.name}
        </h2>
        <p className="text-gray-600 mb-4">
          {videoDetail?.creator || videoBasicInfo.creator || "알 수 없음"}
        </p>

        <div className="space-y-4">
          {/* 프롬프트 - 있는 경우에만 표시 */}
          {videoDetail?.prompt && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                프롬프트
              </h3>
              <ScrollArea className="h-[120px]">
                <p className="text-gray-700 pr-4">{videoDetail.prompt}</p>
              </ScrollArea>
            </div>
          )}

          {/* 메타데이터 그리드 - 있는 정보만 표시 */}
          <div className="grid grid-cols-2 gap-4">
            {videoDetail?.model && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">모델</h3>
                <p className="mt-1">{videoDetail.model}</p>
              </div>
            )}

            {videoDetail?.format && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">포맷</h3>
                <p className="mt-1">{videoDetail.format}</p>
              </div>
            )}

            {/* 조회수 정보 추가 */}
            <div>
              <h3 className="text-sm font-medium text-gray-500">조회수</h3>
              <p className="mt-1">
                {videoDetail?.clickCount?.toLocaleString() || "0"}
              </p>
            </div>

            {videoDetail?.sizeInBytes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">파일 크기</h3>
                <p className="mt-1">
                  {formatFileSize(videoDetail.sizeInBytes)}
                </p>
              </div>
            )}

            {videoDetail?.createdAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">생성일</h3>
                <p className="mt-1">{formatDate(videoDetail.createdAt)}</p>
              </div>
            )}
          </div>

          {/* 버튼 영역 - 좋아요 버튼과 재사용하기 버튼 */}
          <div className="pt-4 flex space-x-4">
            {/* 좋아요 버튼 */}
            <button
              onClick={handleLikeClick}
              className="flex items-center justify-center py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <span className="flex items-center">
                {isLiked ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-pink-500 mr-2"
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-600 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                )}
                <span>{likeCount.toLocaleString()}</span>
              </span>
            </button>

            {/* 재사용하기 버튼 */}
            <button
              onClick={handleReuseVideo}
              className="flex-1 py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              재사용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
