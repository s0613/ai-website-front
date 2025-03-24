"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<LikedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
        console.log("좋아요한 비디오:", data);
        setLikedVideos(data);
        setFilteredVideos(data);
      } catch (err) {
        console.error("좋아요한 비디오 목록 조회 오류:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  // 검색 기능
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVideos(likedVideos);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = likedVideos.filter(
        (video) =>
          video.videoName.toLowerCase().includes(query) ||
          video.creator.toLowerCase().includes(query) ||
          (video.prompt && video.prompt.toLowerCase().includes(query))
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, likedVideos]);

  // 비디오 클릭 핸들러 - 상세 정보 모달 표시
  const handleVideoClick = (videoId: number) => {
    setSelectedVideoId(videoId);
  };

  // 목록으로 돌아가기 핸들러
  const handleBackToList = () => {
    setSelectedVideoId(null);
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0">
        <div className="w-96">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="파일 검색..."
              className="pl-9"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/my/settings")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        <Tabs defaultValue="like">
          <TabsList>
            <TabsTrigger value="like">좋아요</TabsTrigger>
          </TabsList>

          {/* 탭 내용 */}
          <div className="mt-4">
            {isLoading ? (
              // 로딩 상태
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              // 에러 상태
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 text-red-500 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  오류가 발생했습니다
                </h3>
                <p className="mt-2 text-gray-600">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  다시 시도
                </Button>
              </div>
            ) : filteredVideos.length === 0 ? (
              // 비디오가 없는 경우
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {searchQuery
                    ? "검색 결과가 없습니다"
                    : "좋아요한 비디오가 없습니다"}
                </h3>
                <p className="mt-2 text-gray-600">
                  {searchQuery
                    ? "다른 검색어를 입력해보세요"
                    : "비디오를 좋아요하면 여기에 표시됩니다"}
                </p>
              </div>
            ) : (
              // 비디오 그리드
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video.id)}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  >
                    <div className="h-40 w-full bg-gray-100 relative">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.videoName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-12 h-12 text-gray-400"
                          >
                            <path
                              strokeLinecap="round"
                              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* 좋아요 뱃지 */}
                      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center text-xs font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-pink-500 mr-1"
                        >
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                        {video.likeCount}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate">
                        {video.videoName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {video.creator}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 mr-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {video.clickCount || 0}
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
