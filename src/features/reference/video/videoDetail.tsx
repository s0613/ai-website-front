"use client";

import { useRouter } from "next/navigation";
import { formatFileSize, formatDate } from "./utils/formatUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, FileVideo, Info, Layers } from "lucide-react";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-white">
      {/* 비디오 플레이어 섹션 */}
      <div className="md:w-3/5 bg-gray-950 flex items-center justify-center p-0">
        <div className="w-full h-full relative">
          {videoDetail?.url ? (
            <video
              src={videoDetail.url}
              poster={videoDetail.thumbnailUrl || videoBasicInfo.thumbnailUrl}
              controls
              autoPlay
              className="w-full h-full object-contain max-h-[80vh]"
            >
              브라우저가 비디오 태그를 지원하지 않습니다.
            </video>
          ) : (
            <img
              src={videoDetail?.thumbnailUrl || videoBasicInfo.thumbnailUrl}
              alt={videoDetail?.title || videoBasicInfo.name}
              className="w-full h-full object-contain max-h-[80vh]"
            />
          )}
        </div>
      </div>

      {/* 비디오 정보 섹션 - 독립적으로 스크롤 가능하도록 설정 */}
      <div
        className="md:w-2/5 overflow-y-auto bg-white border-l border-gray-200"
        style={{ maxHeight: "80vh" }}
      >
        <div className="p-6">
          {/* 헤더 섹션 */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {videoDetail?.title || videoBasicInfo.name}
            </h1>

            <div className="flex items-center text-gray-500 mb-3">
              <span className="font-medium text-gray-700">
                {videoDetail?.creator || videoBasicInfo.creator || "알 수 없음"}
              </span>

              {videoDetail?.createdAt && (
                <div className="flex items-center ml-4 text-sm">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{formatDate(videoDetail.createdAt)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1 text-gray-400" />
                <span>
                  {videoDetail?.clickCount?.toLocaleString() || "0"} 조회
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`w-4 h-4 mr-1 ${
                    isLiked ? "text-sky-500" : "text-gray-400"
                  }`}
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <span>{likeCount.toLocaleString()}</span>
              </div>

              {videoDetail?.model && (
                <Badge
                  variant="outline"
                  className="text-xs bg-gray-50 text-gray-700 border-gray-200 font-normal"
                >
                  {videoDetail.model}
                </Badge>
              )}
            </div>
          </div>

          {/* 프롬프트 섹션 - 크기 축소 */}
          {videoDetail?.prompt && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Info className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                프롬프트
              </h2>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                <ScrollArea className="h-[80px]">
                  <p className="text-gray-700 pr-4 leading-relaxed text-xs">
                    {videoDetail.prompt}
                  </p>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* 메타데이터 섹션 */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
              상세 정보
            </h2>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 bg-gray-50 rounded-lg border border-gray-200 p-3">
              {videoDetail?.model && (
                <div className="flex items-start">
                  <FileVideo className="w-3.5 h-3.5 mt-0.5 mr-1.5 text-gray-400" />
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 mb-0.5">
                      모델
                    </h3>
                    <p className="text-xs text-gray-800">{videoDetail.model}</p>
                  </div>
                </div>
              )}

              {videoDetail?.sizeInBytes && (
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 mt-0.5 mr-1.5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 mb-0.5">
                      파일 크기
                    </h3>
                    <p className="text-xs text-gray-800">
                      {formatFileSize(videoDetail.sizeInBytes)}
                    </p>
                  </div>
                </div>
              )}

              {videoDetail?.status && (
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 mt-0.5 mr-1.5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 mb-0.5">
                      상태
                    </h3>
                    <p className="text-xs text-gray-800">
                      {videoDetail.status}
                    </p>
                  </div>
                </div>
              )}

              {videoDetail?.prompt && (
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 mt-0.5 mr-1.5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 mb-0.5">
                      카테고리
                    </h3>
                    <p className="text-xs text-gray-800">
                      {getSimpleCategory(videoDetail.prompt)}
                    </p>
                  </div>
                </div>
              )}

              {videoDetail?.sizeInBytes && (
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 mt-0.5 mr-1.5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 mb-0.5">
                      길이
                    </h3>
                    <p className="text-xs text-gray-800">
                      {getSimpleDuration(videoDetail.sizeInBytes)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex space-x-3">
            {/* 좋아요 버튼 - 텍스트 제거, 아이콘만 표시 */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center justify-center w-12 h-12 rounded-full shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLiked
                  ? "bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 focus:ring-sky-500"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
              }`}
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
              title={isLiked ? "좋아요 취소" : "좋아요"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={`w-6 h-6 ${
                  isLiked ? "fill-sky-500" : "fill-none stroke-current stroke-2"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </button>

            <button
              onClick={handleReuseVideo}
              className="flex-1 py-3 px-5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 hover:shadow-md hover:translate-y-[-1px]"
            >
              <span>재사용하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
