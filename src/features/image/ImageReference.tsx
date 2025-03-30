"use client";

import { useState, useEffect } from "react";
import Sidebar, { FilterOptions } from "./sidebar";
import ImageDetail from "./ImageDetail";
import { getImages } from "./services/ImageService";
import { ImageItem } from "./types/Image";

export default function ImageReferencePage() {
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar onFilterChange={handleFilterChange} />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">이미지 레퍼런스</h1>
            <p className="text-lg text-gray-600">
              크리에이티브 작업을 위한 영감
            </p>
          </header>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
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
              <h3 className="mt-2 text-xl font-medium text-gray-900">
                오류가 발생했습니다
              </h3>
              <p className="mt-1 text-gray-500">{error}</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="mb-4 break-inside-avoid bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => handleImageClick(image.id!)}
                >
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.fileName}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">
                      {image.fileName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {image.category || "미분류"}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>{formatFileSize(image.fileSize || 0)}</span>
                      {image.width && image.height && (
                        <>
                          <span className="mx-1">•</span>
                          <span>
                            {image.width}×{image.height}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredImages.length === 0 && !isLoading && !error && (
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
              <h3 className="mt-2 text-xl font-medium text-gray-900">
                검색 결과가 없습니다
              </h3>
              <p className="mt-1 text-gray-500">
                다른 검색어나 필터를 시도해보세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 이미지 상세 정보 모달 */}
      {selectedImageId && selectedImage && (
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
              <ImageDetail image={selectedImage} onBack={handleBackToList} />
            </div>
          </div>
        </div>
      )}
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
