"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Eye,
  Film,
  Clock,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import VideoDetail from "@/features/reference/video/videoDetail";

// 비디오 데이터 타입 정의
interface LikedVideo {
  id: number;
  videoName: string;
  thumbnailUrl: string;
  creator: string;
  createdAt: string;
  likeCount: number;
  clickCount: number;
  prompt?: string;
  model?: string;
  url?: string;
}

// VideoDetail 컴포넌트에서 필요한 기본 비디오 정보 인터페이스
interface VideoBasicInfo {
  id: number;
  name: string;
  thumbnailUrl: string;
  creator: string;
}

const MyLikedPage = () => {
  const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  // 좋아요한 비디오 목록 가져오기
  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/my/creation/video/getLikedVideo", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("좋아요한 비디오 목록을 가져오는데 실패했습니다");
        }

        const data = await response.json();
        setLikedVideos(data);
      } catch (err) {
        console.error("좋아요한 비디오 목록 조회 오류:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  // 비디오 클릭 핸들러 - 상세 정보 모달 표시
  const handleVideoClick = (videoId: number) => {
    setSelectedVideoId(videoId);
  };

  // 목록으로 돌아가기 핸들러
  const handleBackToList = () => {
    setSelectedVideoId(null);
  };

  // LikedVideo를 VideoBasicInfo로 변환하는 도우미 함수
  const getVideoBasicInfo = (id: number): VideoBasicInfo => {
    const video = likedVideos.find((v) => v.id === id);
    if (!video) {
      return {
        id: id,
        name: "알 수 없는 비디오",
        thumbnailUrl: "",
        creator: "알 수 없음",
      };
    }

    return {
      id: video.id,
      name: video.videoName,
      thumbnailUrl: video.thumbnailUrl,
      creator: video.creator,
    };
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 p-6 overflow-y-auto">
        <Tabs defaultValue="like" className="w-full">
          <TabsList className="bg-gray-100/80 p-0.5 rounded-lg">
            <TabsTrigger
              value="like"
              className="flex items-center gap-1.5 py-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 text-gray-600 shadow-none data-[state=active]:shadow-sm"
            >
              <Heart className="h-4 w-4" />
              <span>좋아요</span>
            </TabsTrigger>
          </TabsList>

          {/* 탭 내용 */}
          <div className="mt-6">
            {isLoading ? (
              // 로딩 상태
              <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">
                  좋아요한 작업물을 불러오는 중...
                </p>
              </div>
            ) : error ? (
              // 에러 상태
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <div className="bg-red-50 text-red-500 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  오류가 발생했습니다
                </h3>
                <p className="text-red-500 mb-4">{error}</p>
                <Button
                  className="bg-sky-500 hover:bg-sky-600 text-white"
                  onClick={() => window.location.reload()}
                >
                  다시 시도
                </Button>
              </div>
            ) : likedVideos.length === 0 ? (
              // 비디오가 없는 경우
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <div className="bg-sky-50 text-sky-500 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  좋아요한 비디오가 없습니다
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  비디오를 좋아요하면 여기에 표시됩니다
                </p>
              </div>
            ) : (
              // 비디오 그리드
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {likedVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video.id)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200/80 hover:shadow-md hover:border-sky-200 transition-all duration-300 cursor-pointer overflow-hidden group"
                  >
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                        <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                          <Film className="w-6 h-6 text-sky-500" />
                        </div>
                      </div>

                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.videoName}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200">
                          <Film className="w-12 h-12 text-gray-400" />
                        </div>
                      )}

                      {/* 그라데이션 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>

                      {/* 좋아요 뱃지 */}
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center text-xs font-medium shadow-sm">
                        <Heart className="w-3.5 h-3.5 text-sky-500 mr-1 fill-current" />
                        <span>{video.likeCount}</span>
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1 text-gray-900 mb-1">
                        {video.videoName}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {video.creator}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Eye className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          <span>{video.clickCount || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          <span>{formatDate(video.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </div>

      {/* 비디오 상세 정보 모달 */}
      {selectedVideoId !== null && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={handleBackToList}
        >
          <div
            className="relative bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-4xl mx-auto border border-gray-200 animate-in zoom-in-95 duration-300"
            style={{ maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
              onClick={handleBackToList}
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="h-full overflow-y-auto">
              <VideoDetail
                videoId={selectedVideoId}
                videoBasicInfo={getVideoBasicInfo(selectedVideoId)}
                onBack={handleBackToList}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLikedPage;
