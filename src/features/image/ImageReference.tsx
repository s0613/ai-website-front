"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js의 라우터
import Sidebar, { FilterOptions } from "./sidebar";
import { getImages } from "./services/ImageService";
import { ImageItem } from "./types/Image";
import { useAuth } from "../user/AuthContext"; // AuthContext import

export default function ImageReferencePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth(); // 인증 상태 확인
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);

        // ImageService를 사용하여 이미지 가져오기
        const fetchedImages = await getImages();

        console.log("가져온 이미지 수:", fetchedImages.length);

        // 이미지 데이터 처리 및 정규화
        const processedImages = fetchedImages.map((image) => ({
          ...image,
          // 누락된 필드에 대한 기본값 설정
          id: image.id || 0,
          name: image.fileName || "제목 없음",
          thumbnailUrl: image.url || "",
          prompt: image.category || "",
          format: image.url.split(".").pop() || "png",
          sizeInBytes: image.fileSize || 0,
          status: "완료",
          createdAt: image.lastModified || new Date().toISOString(),
          creator: "관리자",
        }));

        // 최신순으로 정렬
        processedImages.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setImages(processedImages);
        setFilteredImages(processedImages);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching images:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // 이미지 다운로드 함수
  const handleDownload = (e: React.MouseEvent, image: ImageItem) => {
    e.stopPropagation(); // 이벤트 버블링 방지

    // 로그인 확인 - 로그인 되어있지 않으면 로그인 페이지로 이동
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // 로그인된 경우에만 다운로드 진행
    const link = document.createElement("a");
    link.href = image.url;
    link.download = image.fileName || `image-${image.id}.${image.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...images];

    // 검색어 필터링
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (image) =>
          image.fileName.toLowerCase().includes(searchLower) ||
          image.category?.toLowerCase().includes(searchLower)
      );
    }

    // 카테고리 필터링
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes("모든 이미지")
    ) {
      filtered = filtered.filter((image) =>
        filters.categories.includes(image.category)
      );
    }

    // 크기 필터링
    if (filters.size !== "모든 크기") {
      filtered = filtered.filter(
        (image) => getSimpleSize(image.fileSize || 0) === filters.size
      );
    }

    // 정렬
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

    setFilteredImages(filtered);
  };

  const handleImageClick = (imageId: number) => {
    setSelectedImageId(imageId);
  };

  const handleBackToList = () => {
    setSelectedImageId(null);
  };

  const selectedImage = selectedImageId
    ? images.find((v) => v.id === selectedImageId)
    : null;

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black">
      {/* 사이드바 */}
      <Sidebar onFilterChange={handleFilterChange} />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {error ? (
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
              <h3 className="mt-2 text-xl font-medium text-white">
                오류가 발생했습니다
              </h3>
              <p className="mt-1 text-gray-400">{error}</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="mb-4 break-inside-avoid bg-black/40 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 group relative hover:scale-[1.02] hover:bg-black/80 hover:border-white/30"
                >
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.fileName}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                    {/* 호버 시 표시되는 그라데이션 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>

                    {/* 왼쪽 하단 파일명과 다운로드 버튼 */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white flex justify-between items-center">
                      <span className="text-sm font-medium truncate group-hover:text-sky-500 transition-colors duration-300">
                        {image.fileName}
                      </span>
                      <button
                        onClick={(e) => handleDownload(e, image)}
                        className="bg-sky-500 hover:bg-sky-600 rounded-full p-1.5 ml-2 transition-colors"
                        title="다운로드 (로그인 필요)"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredImages.length === 0 && !error && (
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
              <h3 className="mt-2 text-xl font-medium text-white">
                검색 결과가 없습니다
              </h3>
              <p className="mt-1 text-gray-400">
                다른 검색어나 필터를 시도해보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 유틸리티 함수
const getSimpleSize = (sizeInBytes: number): string => {
  const sizeMB = sizeInBytes / (1024 * 1024);
  if (sizeMB < 1) return "작은 이미지";
  if (sizeMB < 5) return "중간 크기";
  return "큰 이미지";
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
