"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Download, Loader2, ImageIcon, RefreshCw } from "lucide-react";

interface ImageResponse {
  url: string;
  fileName: string;
  size: number;
  lastModified: string;
  width?: number;
  height?: number;
}

const ImageGallery = () => {
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "masonry">("masonry");

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ImageResponse[]>(
        `/api/admin/image/get`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 304) {
        const imageList = await Promise.all(
          response.data.map(async (image) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.src = image.url;

            try {
              await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () =>
                  reject(new Error(`Failed to load image: ${image.fileName}`));
                setTimeout(
                  () => reject(new Error("Image load timeout")),
                  10000
                );
              });

              return {
                ...image,
                width: img.width,
                height: img.height,
              };
            } catch {
              console.warn(
                `Skipping image ${image.fileName} due to load error`
              );
              return {
                ...image,
                width: 300,
                height: 300,
              };
            }
          })
        );

        setImages(imageList);
      }
    } catch (error) {
      console.error("이미지 가져오기 실패", error);
      setError("이미지를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const getFormattedFileName = (fileName: string) => {
    return fileName.split("/").pop()?.split(".").slice(0, -1).join(".");
  };

  const getAspectRatio = (width: number, height: number) => {
    return Math.ceil((height / width) * 10);
  };

  return (
    // 전체 컨테이너에서 container, mx-auto, px-4 제거 → w-full, px-0 등으로 대체
    <div className="w-full py-8 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200">
      {/* 상단 컨트롤 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-4">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center text-gray-900">
            <span className="inline-block w-1.5 h-6 bg-gradient-to-b from-sky-400 to-sky-500 mr-3 rounded-full"></span>
            트렌딩 생성 결과
          </h2>
          <p className="text-gray-600 text-sm">
            최근 인기 있는 AI 생성 이미지 컬렉션
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 space-x-4">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-full transition-colors ${
              view === "grid"
                ? "bg-gradient-to-r from-sky-400/20 to-sky-500/20 text-sky-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm"
            }`}
            aria-label="Grid view"
          >
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
              <div className="w-2 h-2 bg-current rounded-sm"></div>
            </div>
          </button>
          <button
            onClick={() => setView("masonry")}
            className={`p-2 rounded-full transition-colors ${
              view === "masonry"
                ? "bg-gradient-to-r from-sky-400/20 to-sky-500/20 text-sky-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm"
            }`}
            aria-label="Masonry view"
          >
            <div className="flex space-x-0.5">
              <div className="w-1 h-4 bg-current rounded-sm"></div>
              <div className="w-1 h-3 bg-current rounded-sm"></div>
              <div className="w-1 h-5 bg-current rounded-sm"></div>
              <div className="w-1 h-2 bg-current rounded-sm"></div>
            </div>
          </button>
          <button
            onClick={fetchImages}
            className="p-2 rounded-full text-gray-500 hover:text-sky-600 hover:bg-white hover:shadow-sm transition-all duration-300"
            aria-label="Refresh images"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* 로딩, 에러, 또는 이미지 표시 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400/15 to-sky-500/15 mb-4 shadow-sm">
            <Loader2 className="h-10 w-10 text-sky-600 animate-spin" />
          </div>
          <p className="text-sky-700 font-medium">
            이미지를 불러오는 중입니다...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl mb-4 border border-red-100 shadow-sm">
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={fetchImages}
            className="px-6 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-full hover:from-sky-600 hover:to-sky-700 transition-colors shadow-sm"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <>
          {images.length > 0 ? (
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
              {images.map((image, index) => {
                if (!image.width || !image.height) return null;
                const fileName = getFormattedFileName(image.fileName);

                return (
                  <div
                    key={index}
                    className={`
                      relative group overflow-hidden rounded-xl mb-5
                      ${view === "grid" ? "" : "break-inside-avoid"}
                      transform transition duration-300 hover:shadow-xl hover:-translate-y-1
                    `}
                    style={
                      view === "grid"
                        ? {
                            gridRowEnd: `span ${getAspectRatio(
                              image.width,
                              image.height
                            )}`,
                          }
                        : {}
                    }
                  >
                    {/* 여기서 bg-gray-100 제거 */}
                    <div className="relative aspect-auto overflow-hidden rounded-xl">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={fileName || "AI generated image"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <a
                        href={image.url}
                        download
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-gradient-to-r hover:from-sky-50 hover:to-sky-100"
                        aria-label="Download image"
                      >
                        <Download className="h-4 w-4 text-sky-700" />
                      </a>
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <p className="text-sm font-medium text-white truncate">
                          {fileName || "Untitled Image"}
                        </p>
                        <p className="text-xs text-white/80">
                          {image.width}×{image.height}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gradient-to-r from-sky-50 to-sky-100 p-6 rounded-full mb-4 shadow-sm">
                <ImageIcon className="h-10 w-10 text-sky-400" />
              </div>
              <h3 className="text-lg font-medium text-sky-700 mb-2">
                이미지가 없습니다
              </h3>
              <p className="text-gray-600 max-w-md">
                현재 표시할 이미지가 없습니다. 나중에 다시 확인하거나 새로운
                이미지를 생성해 보세요.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageGallery;
