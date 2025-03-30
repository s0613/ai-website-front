"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, FileVideo } from "lucide-react";
import {
  getSharedVideos,
  getSharedVideosNoLogin,
  updateVideoLike,
} from "../video/services/MyVideoService";
import { VideoDto, VideoItem } from "../video/types/Video";
import VideoDetail from "../video/videoReference/videoDetail";

const VideoGallery = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view] = useState<"grid" | "masonry">("masonry");
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // 로그인 상태 확인
      const checkLoginStatus = () => {
        // 쿠키에서 로그인 토큰 확인
        const cookies = document.cookie.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          acc[key] = value;
          return acc;
        }, {} as { [key: string]: string });

        const hasAuthToken =
          cookies.access_token ||
          cookies.jwt ||
          cookies["auth-token"] ||
          localStorage.getItem("auth-token");

        const loggedIn = !!hasAuthToken;
        setIsLoggedIn(loggedIn);
        return loggedIn;
      };

      // 로그인 상태에 따라 다른 API 호출
      const loggedIn = checkLoginStatus();
      const videoData: VideoDto[] = loggedIn
        ? await getSharedVideos()
        : await getSharedVideosNoLogin();

      // 비디오 데이터 처리
      const sizes: Array<"small" | "medium" | "large"> = [
        "small",
        "medium",
        "large",
      ];

      // VideoDto를 VideoItem으로 매핑
      const initialProcessedVideos = videoData.map((video, index) => ({
        id: video.id || 0,
        name: video.name || "제목 없음",
        thumbnailUrl: video.thumbnailUrl || "",
        url: video.url || "",
        creator: video.creator || "알 수 없음",
        size: sizes[index % sizes.length],
        aspectRatio: 16 / 9, // 기본값
        likeCount: video.likeCount || 0,
        liked: video.liked || false,
      }));

      // 비디오 메타데이터로 실제 비율 계산
      const videoList = await Promise.all(
        initialProcessedVideos.map(async (video) => {
          try {
            const videoElement = document.createElement("video");
            videoElement.src = video.url;

            const metadataLoaded = new Promise<void>((resolve) => {
              videoElement.onloadedmetadata = () => resolve();
              videoElement.onerror = () => resolve();
              // 10초 후 타임아웃
              setTimeout(() => resolve(), 10000);
            });

            await metadataLoaded;

            let aspectRatio = 16 / 9;
            if (videoElement.videoWidth && videoElement.videoHeight) {
              aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
            }

            return {
              ...video,
              aspectRatio,
            };
          } catch (err) {
            console.warn(`비디오 메타데이터 로드 실패: ${video.name}`, err);
            return video;
          }
        })
      );

      setVideos(videoList);
    } catch (error) {
      console.error("비디오 가져오기 실패", error);
      setError("비디오를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleVideoClick = (videoId: number) => {
    setSelectedVideoId(videoId);
  };

  const handleBackToList = () => {
    setSelectedVideoId(null);
  };

  const getAspectRatio = (aspectRatio: number) => {
    return Math.ceil((1 / aspectRatio) * 10);
  };

  return (
    <div className="w-full bg-gradient-to-b from-gray-200 via-gray-100 to-gray-50">
      {/* 상단 컨트롤 영역 */}
      <div className="px-4 mb-8">
        <div>
          <h2 className="text-lg font-bold mb-2 flex items-center text-gray-900">
            <span className="inline-block w-1.5 h-4 bg-gradient-to-b from-sky-400 to-sky-500 mr-3 rounded-full"></span>
            트렌딩 비디오
          </h2>
        </div>
      </div>

      {/* 로딩, 에러, 또는 비디오 표시 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400/15 to-sky-500/15 mb-4 shadow-sm">
            <Loader2 className="h-10 w-10 text-sky-600 animate-spin" />
          </div>
          <p className="text-sky-700 font-medium">
            비디오를 불러오는 중입니다...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl mb-4 border border-red-100 shadow-sm">
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={fetchVideos}
            className="px-6 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-full hover:from-sky-600 hover:to-sky-700 transition-colors shadow-sm"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <>
          {videos.length > 0 ? (
            <div
              className={`
                ${
                  view === "masonry"
                    ? "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5"
                    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
                }
                px-4
              `}
            >
              {videos.map((video, index) => {
                if (!video.url) return null;

                return (
                  <div
                    key={index}
                    className={`
                      relative group overflow-hidden rounded-xl mb-5 cursor-pointer
                      ${view === "grid" ? "" : "break-inside-avoid"}
                      transform transition duration-300 hover:shadow-xl hover:-translate-y-1
                    `}
                    style={
                      view === "grid"
                        ? {
                            gridRowEnd: `span ${getAspectRatio(
                              video.aspectRatio
                            )}`,
                          }
                        : {}
                    }
                    onClick={() => handleVideoClick(video.id)}
                  >
                    <div className="relative aspect-auto overflow-hidden rounded-xl">
                      {/* 썸네일 이미지 */}
                      <img
                        src={video.thumbnailUrl || "/placeholder.svg"}
                        alt={video.name}
                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0 pointer-events-none"
                        loading="lazy"
                      />

                      {/* 비디오 요소 */}
                      <video
                        src={video.url}
                        className="w-full h-full object-cover absolute inset-0 z-0"
                        preload="auto"
                        muted
                        playsInline
                        loop
                        onMouseEnter={(e) => {
                          const playPromise = e.currentTarget.play();
                          if (playPromise !== undefined) {
                            playPromise.catch((error) => {
                              console.error("비디오 재생 실패:", error);
                            });
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />

                      {/* 플레이 아이콘 오버레이 */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-black/40 rounded-full p-3">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      {/* 그라데이션 오버레이 */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white z-30">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-medium text-white truncate">
                              {video.name}
                            </h3>
                            <p className="text-xs text-white/80">
                              {video.creator}
                            </p>
                          </div>
                          <div className="flex items-center">
                            {video.liked ? (
                              <svg
                                className="w-4 h-4 fill-current text-red-500"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            )}
                            <span className="ml-1 text-xs">
                              {video.likeCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gradient-to-r from-sky-50 to-sky-100 p-6 rounded-full mb-4 shadow-sm">
                <FileVideo className="h-10 w-10 text-sky-400" />
              </div>
              <h3 className="text-lg font-medium text-sky-700 mb-2">
                비디오가 없습니다
              </h3>
              <p className="text-gray-600 max-w-md">
                현재 표시할 비디오가 없습니다. 나중에 다시 확인하거나 새로운
                비디오를 생성해 보세요.
              </p>
            </div>
          )}
        </>
      )}

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
                videoBasicInfo={videos.find((v) => v.id === selectedVideoId)!}
                onBack={handleBackToList}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
