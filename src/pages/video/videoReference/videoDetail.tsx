"use client";

import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, FileVideo, Info, Layers } from "lucide-react";
import { getVideoById, updateVideoLike } from "../services/MyVideoService";
import { VideoDto } from "../types/Video";
import { useAuth } from "@/pages/user/AuthContext"; // AuthContext에서 useAuth 가져오기

// 기본 비디오 정보 인터페이스
interface VideoBasicInfo {
  id: number;
  name: string;
  thumbnailUrl: string;
  creator: string;
}

// 상세 비디오 정보 인터페이스 - VideoDto와 호환
interface VideoDetailInfo {
  title?: string;
  creator?: string;
  thumbnailUrl?: string;
  prompt?: string;
  url?: string;
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

export default function VideoDetail({
  videoId,
  videoBasicInfo,
  onBack,
}: VideoDetailProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth(); // 로그인 상태 가져오기
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

        // MyVideoService의 getVideoById 함수 사용
        const videoData = await getVideoById(videoId);
        console.log("비디오 상세 정보:", videoData);

        if (videoData) {
          // VideoDto에서 VideoDetailInfo로 데이터 매핑
          setVideoDetail({
            title: videoData.name || videoBasicInfo.name,
            creator: videoData.creator || videoBasicInfo.creator,
            thumbnailUrl: videoData.thumbnailUrl || videoBasicInfo.thumbnailUrl,
            prompt: videoData.prompt || "",
            url: videoData.url || "",
            status: "완료", // 기본값 설정
            createdAt: videoData.createdAt || "",
            model: videoData.model || "",
            clickCount: videoData.clickCount || 0,
            likeCount: videoData.likeCount || 0,
            liked: videoData.liked || false,
          });

          setLikeCount(videoData.likeCount || 0);
          setIsLiked(videoData.liked || false);
        } else {
          // 데이터가 없으면 기본 정보만 사용
          setVideoDetail({
            title: videoBasicInfo.name,
            creator: videoBasicInfo.creator,
            thumbnailUrl: videoBasicInfo.thumbnailUrl,
            clickCount: 0,
            likeCount: 0,
          });
          setLikeCount(0);
          setIsLiked(false);
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
        setIsLiked(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoDetail();
  }, [videoId, videoBasicInfo]);

  // 비디오 재사용 핸들러
  const handleReuseVideo = () => {
    // 로그인 상태 확인
    if (!isLoggedIn) {
      // 로그인되지 않은 경우, 로그인 페이지로 이동하고 현재 페이지를 콜백 URL로 설정
      const currentUrl = window.location.href;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // 로그인된 경우만 아래 코드 실행
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
      // MyVideoService의 updateVideoLike 함수 사용
      const updatedVideo = await updateVideoLike(videoId, newLikedState);

      // API 응답에서 받은 좋아요 수로 업데이트
      if (updatedVideo.likeCount !== undefined) {
        setLikeCount(updatedVideo.likeCount);
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
    <div className="flex flex-col md:flex-row h-full bg-black">
      {/* 비디오 플레이어 섹션 */}
      <div className="md:w-3/5 bg-black/40 backdrop-blur-xl flex items-center justify-center p-0">
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
        className="md:w-2/5 overflow-y-auto bg-black/40 backdrop-blur-xl border-l border-white/20"
        style={{ maxHeight: "80vh" }}
      >
        <div className="p-6">
          {/* 헤더 섹션 */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-2 leading-tight">
              {videoDetail?.title || videoBasicInfo.name}
            </h1>

            <div className="flex items-center text-gray-300 mb-3">
              <span className="font-medium text-white">
                {videoDetail?.creator || videoBasicInfo.creator || "알 수 없음"}
              </span>

              {videoDetail?.createdAt && (
                <div className="flex items-center ml-4 text-sm">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-300">
                <Eye className="w-4 h-4 mr-1 text-gray-400" />
                <span>
                  {videoDetail?.clickCount?.toLocaleString() || "0"} 조회
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`w-4 h-4 mr-1 ${isLiked ? "text-sky-500" : "text-gray-400"
                    }`}
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <span>{likeCount.toLocaleString()} 좋아요</span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-3 mb-6">
            <button
              onClick={handleReuseVideo}
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >

              이 영상으로 새로 만들기
            </button>
            <button
              onClick={handleLikeClick}
              className={`flex items-center justify-center p-2 rounded-full transition-colors duration-200 ${isLiked
                ? "text-red-500 hover:bg-red-500/10"
                : "text-gray-400 hover:bg-white/10"
                }`}
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                className="w-6 h-6"
                strokeWidth={isLiked ? "0" : "2"}
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </button>
          </div>

          {/* 상세 정보 */}
          <div className="space-y-4">
            {videoDetail?.prompt && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-gray-400" />
                  프롬프트
                </h3>
                <p className="text-sm text-gray-300 bg-black/40 p-3 rounded-lg border border-white/20">
                  {videoDetail.prompt}
                </p>
              </div>
            )}

            {videoDetail?.model && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-gray-400" />
                  사용 모델
                </h3>
                <Badge variant="outline" className="bg-black/40 border-white/20 text-gray-300">
                  {videoDetail.model}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
