"use client";

import React, { useState } from "react";
import ImageSidebar, { ImageSidebarFormData } from "./ImageSidebar";
import Image from "next/image";

export default function ImageGeneration() {
  const [imageUrl, setImageUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [selectedModel, setSelectedModel] = useState("stable-diffusion");

  const handleSidebarSubmit = async (data: ImageSidebarFormData) => {
    setErrorMessage("");
    setImageUrl("");
    setIsLoading(true);

    try {
      let endpoint = "";
      // 선택된 모델에 따라 호출할 API 결정
      if (activeTab === "text") {
        endpoint = `/api/image/${selectedModel}/text`;
      } else {
        endpoint = `/api/image/${selectedModel}/image`;
      }

      let referenceImageBase64 = "";
      if (data.referenceImage) {
        const reader = new FileReader();
        reader.readAsDataURL(data.referenceImage);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              referenceImageBase64 = reader.result;
            }
            resolve(null);
          };
        });
      }

      const payload: {
        prompt: string;
        negativePrompt: string;
        referenceImage?: string;
        aspectRatio: string;
        quality: string;
        style: string;
      } = {
        prompt: data.prompt,
        negativePrompt: data.negativePrompt,
        aspectRatio: data.aspectRatio,
        quality: data.quality,
        style: data.style
      };

      if (referenceImageBase64 && activeTab === "image") {
        payload.referenceImage = referenceImageBase64;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "알 수 없는 오류" }));
        throw new Error(error || "이미지 생성 실패");
      }

      const result = await res.json();
      if (result.imageUrl) {
        setImageUrl(result.imageUrl);
      } else {
        setErrorMessage(
          "이미지가 아직 생성되지 않았습니다. Job ID: " +
            JSON.stringify(result)
        );
      }
    } catch {
      setErrorMessage("오류 발생");
    } finally {
      setIsLoading(false);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tab: "text" | "image") => {
    setActiveTab(tab);
    // 탭이 변경될 때 적절한 기본 모델 설정
    if (tab === "text") {
      setSelectedModel("stable-diffusion");
    } else {
      setSelectedModel("controlnet");
    }
  };

  return (
    <div className="flex w-full h-screen">
      <div className="w-1/4 h-full min-w-[320px]">
        <ImageSidebar onSubmit={handleSidebarSubmit} onTabChange={handleTabChange} />
      </div>
      <div className="flex-1 h-full flex flex-col">
        {/* 모델 선택 드롭다운 */}
        <div className="p-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="rounded-md border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
          >
            {activeTab === "text" ? (
              <>
                <option value="stable-diffusion">Stable Diffusion</option>
                <option value="dalle">DALL-E</option>
                <option value="midjourney">Midjourney</option>
              </>
            ) : (
              <>
                <option value="controlnet">ControlNet</option>
                <option value="img2img">Img2Img</option>
              </>
            )}
          </select>
        </div>
        
        {/* 이미지 결과 영역 */}
        <div className="flex-1 flex items-center justify-center p-6">
          {isLoading && (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">이미지 생성 중...</p>
            </div>
          )}
          
          {errorMessage && (
            <div className="text-red-600 p-4 bg-red-50 rounded-md">
              {errorMessage}
            </div>
          )}
          
          {imageUrl && !isLoading && (
            <div className="relative max-h-[80vh] max-w-full overflow-hidden rounded-lg shadow-lg">
              <Image 
                src={imageUrl} 
                alt="생성된 이미지" 
                width={512} 
                height={512} 
                className="object-contain"
                style={{ maxWidth: '100%', height: 'auto' }} 
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = '생성된_이미지.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md"
                >
                  다운로드
                </button>
              </div>
            </div>
          )}
          
          {!imageUrl && !isLoading && !errorMessage && (
            <div className="text-center text-gray-500">
              <p className="text-lg">이미지 생성을 시작하려면</p>
              <p>왼쪽 패널에서 설정을 구성하고 이미지 생성 버튼을 클릭하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}