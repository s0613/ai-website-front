"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

// 이미지 응답 인터페이스 (전역 Image와 이름 충돌 방지를 위해 ImageResponse 사용)
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get<ImageResponse[]>(`${baseUrl}/api/images`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status !== 304) {
          const imageList = await Promise.all(
            response.data.map(async (image) => {
              // 브라우저의 Image 객체를 사용하여 이미지의 실제 크기를 가져옴
              const img = new window.Image();
              img.src = image.url;
              await new Promise<void>((resolve) => {
                img.onload = () => resolve();
              });
              
              return {
                ...image,
                width: img.width,
                height: img.height,
              };
            })
          );

          setImages(imageList);
        }
        setLoading(false);
      } catch (error) {
        console.error("이미지 가져오기 실패", error);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="image-gallery p-4">
      {loading ? (
        <p>이미지 로딩 중...</p>
      ) : (
        <div className="image-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.length > 0 ? (
            images.map((image, index) => {
              if (!image.width || !image.height) return null;

              const fileName = image.fileName.split('/').pop()?.split('.').slice(0, -1).join('.'); // 폴더 경로와 확장자 제거

              return (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-inner"
                  style={{
                    gridRowEnd: `span ${Math.ceil((image.height / image.width) * 10)}`,
                  }}
                >
                  <img
                    src={image.url}
                    alt={fileName}
                    className="w-full h-full object-cover"
                  />

                  {/* 이미지 전체를 어둡게 하는 오버레이 */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                  {/* 다운로드 아이콘 (배경 없음, 검은색) */}
                  <a
                    href={image.url}
                    download
                    className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v4h16v-4M12 12v8m0 0l-3-3m3 3l3-3"
                      />
                    </svg>
                  </a>

                  {/* 왼쪽 하단에 이미지 이름 표시 */}
                  <div className="absolute bottom-2 left-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-semibold">{fileName}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>이미지가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;