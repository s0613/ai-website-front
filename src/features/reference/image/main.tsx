"use client";

import { useState, useEffect } from "react";
import Sidebar, { FilterOptions } from "./sidebar";
import ImageDetail from "./ImageDetail";

// ImageItem 인터페이스
interface ImageItem {
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
}

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

        // 두 API 요청을 병렬로 실행
        const [adminResponse, sharedResponse] = await Promise.all([
          fetch("/api/admin/image/getAll"),
          fetch("/api/my/creation/image/getSharedImage"),
        ]);

        // 각 응답 확인 및 데이터 추출
        if (!adminResponse.ok) {
          console.error("관리자 이미지 불러오기 실패:", adminResponse.status);
        }

        if (!sharedResponse.ok) {
          console.error("공유 이미지 불러오기 실패:", sharedResponse.status);
        }

        // 응답 데이터 파싱
        const adminImages = adminResponse.ok ? await adminResponse.json() : [];
        const sharedImages = sharedResponse.ok
          ? await sharedResponse.json()
          : [];

        console.log(
          "관리자 이미지:",
          adminImages.length,
          "공유 이미지:",
          sharedImages.length
        );

        // ID 기준으로 중복 제거를 위한 Map 사용
        const imageMap = new Map();

        // 관리자 이미지 추가
        adminImages.forEach((image) => {
          imageMap.set(image.id, {
            ...image,
            creator: "관리자",
          });
        });

        // 공유 이미지 추가 (이미 존재하는 ID의 경우 덮어쓰기)
        sharedImages.forEach((image) => {
          // 만약 sharedImages의 구조가 다르다면 여기서 구조를 통일시켜야 함
          if (!imageMap.has(image.id)) {
            imageMap.set(image.id, {
              ...image,
              // image 객체에 필요한 필드가 없다면 기본값 지정
              name: image.name || image.aiImageName || "제목 없음",
              url: image.url || image.imageUrl || "",
              thumbnailUrl: image.thumbnailUrl || image.url || "",
              format: image.format || "png",
              sizeInBytes: image.sizeInBytes || 0,
              status: image.status || "완료",
              createdAt: image.createdAt || new Date().toISOString(),
              creator: image.creator || image.email || "사용자", // 생성자 정보 추가
            });
          }
        });

        // Map에서 배열로 변환
        const combinedImages = Array.from(imageMap.values());

        // 최신순으로 정렬
        combinedImages.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setImages(combinedImages);
        setFilteredImages(combinedImages);
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
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (image) =>
          image.name.toLowerCase().includes(searchLower) ||
          image.prompt?.toLowerCase().includes(searchLower)
      );
    }
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes("모든 이미지")
    ) {
      filtered = filtered.filter((image) =>
        filters.categories.includes(getSimpleCategory(image.prompt))
      );
    }
    if (filters.size !== "모든 크기") {
      filtered = filtered.filter(
        (image) => getSimpleSize(image.sizeInBytes) === filters.size
      );
    }
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

  const handleImageHover = (imageElement: HTMLImageElement | null) => {
    if (imageElement) {
      // 이미지 호버 효과를 구현할 수 있음
      // 예: 애니메이션 또는 스타일 변경
    }
  };

  const handleImageLeave = (imageElement: HTMLImageElement | null) => {
    if (imageElement) {
      // 이미지 호버 해제 효과
    }
  };

  const selectedImage = selectedImageId
    ? images.find((v) => v.id === selectedImageId)
    : null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onFilterChange={handleFilterChange} />

      {/* Main Content */}
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
            // CSS Columns를 사용하여 테트리스(마젠리) 형식으로 배치
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="mb-4 break-inside-avoid bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => handleImageClick(image.id)}
                >
                  <div
                    className="relative"
                    onMouseEnter={(e) => {
                      const imageEl = e.currentTarget.querySelector("img");
                      handleImageHover(imageEl);
                    }}
                    onMouseLeave={(e) => {
                      const imageEl = e.currentTarget.querySelector("img");
                      handleImageLeave(imageEl);
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">{image.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {image.creator || "알 수 없음"}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500"></div>
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
const getSimpleCategory = (prompt: string): string => {
  const promptLower = prompt?.toLowerCase() || "";
  if (promptLower.includes("nature") || promptLower.includes("자연"))
    return "자연";
  if (promptLower.includes("city") || promptLower.includes("도시"))
    return "도시";
  return "기타";
};

const getSimpleSize = (sizeInBytes: number): string => {
  const sizeMB = sizeInBytes / (1024 * 1024);
  if (sizeMB < 1) return "작은 이미지";
  if (sizeMB < 5) return "중간 크기";
  return "큰 이미지";
};
