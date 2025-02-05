"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

// 이미지 응답 인터페이스
interface Image {
    url: string;
    fileName: string;
    size: number;
    lastModified: string;
    width?: number;
    height?: number;
}

const ImageGallery = () => {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get<Image[]>("http://localhost:8080/api/images", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.status !== 304) {
                    const imageList = await Promise.all(
                        response.data.map(async (image) => {
                            const img = new Image();
                            img.src = image.url;
                            await new Promise((resolve) => {
                                img.onload = resolve;
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
                <div className="image-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" style={{ columnGap: '1rem' }}>
                    {images.length > 0 ? (
                        images.map((image, index) => {
                            if (!image.width || !image.height) return null;

                            return (
                                <div
                                    key={index}
                                    className="image-item bg-gray-200 rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                                    style={{
                                        gridRowEnd: `span ${Math.ceil((image.height / image.width) * 10)}`
                                    }}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.fileName}
                                        className="w-full h-full object-cover rounded-lg transition-all duration-300 ease-in-out"
                                    />

                                    {/* 이미지 설명 부분 */}
                                    <div className="image-meta absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                        <p className="text-white font-semibold">{image.fileName}</p>
                                        <p className="text-white">{(image.size / 1024).toFixed(2)} KB</p>
                                        <p className="text-white">{new Date(image.lastModified).toLocaleString()}</p>
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

// 스타일 정의 (Tailwind CSS 기반)
// Tailwind CSS 클래스가 각 컴포넌트에 적용되어 Masonry 레이아웃 지원 및 반응형 디자인 가능
