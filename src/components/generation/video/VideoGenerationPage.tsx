"use client";

import React, { useState } from "react";
import VideoSidebar, { SidebarFormData } from "./VideoSidebar";

export default function VideoGenerationPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");
  const [selectedEndpoint, setSelectedEndpoint] = useState("luna");

  const handleSidebarSubmit = async (data: SidebarFormData) => {
    setErrorMessage("");
    setVideoUrl("");
    setIsLoading(true);

    try {
      let endpoint = "";
      // 선택된 API 엔드포인트에 따라 호출할 API 결정
      if (selectedEndpoint === "veo2") {
        endpoint = "/api/video/veo2";
      } else if (selectedEndpoint === "luna") {
        endpoint = data.imageFile ? "/api/video/luma/image" : "/api/video/luma/text";
      }

      let imageBase64 = "";
      if (data.imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(data.imageFile);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              imageBase64 = reader.result;
            }
            resolve(null);
          };
        });
      }

      const payload: {
        prompt: string;
        imageUrl?: string;
        aspectRatio: string;
        duration: string;
      } = {
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        duration: data.duration,
      };

      if (imageBase64) {
        payload.imageUrl = imageBase64;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "영상 생성 실패");
      }

      const result = await res.json();
      if (result.videoUrl) {
        setVideoUrl(result.videoUrl);
      } else {
        setErrorMessage(
          "videoUrl이 아직 생성되지 않았습니다. Job ID: " +
            JSON.stringify(result)
        );
      }
    } catch  {
      setErrorMessage( "오류 발생");
    } finally {
      setIsLoading(false);
    }
  };

  // 업데이트된 activeTab를 VideoSidebar에서 받아오기 위한 핸들러
  const handleTabChange = (tab: "image" | "text") => {
    setActiveTab(tab);
    // 이미지 탭이면 luna 만 옵션, 텍스트 탭이면 veo2와 luna 선택 옵션 제공
    if (tab === "image") {
      setSelectedEndpoint("luna");
    } else {
      // 기본값 텍스트 탭은 veo2 선택
      setSelectedEndpoint("veo2");
    }
  };

  return (
    <div className="flex w-full h-screen">
      <div className="w-1/4 h-full min-w-[320px]">
        <VideoSidebar onSubmit={handleSidebarSubmit} onTabChange={handleTabChange} />
      </div>
      <div className="flex-1 h-full flex flex-col">
        {/* API 엔드포인트 select - 오른쪽 패널 상단 좌측 */}
        <div className="p-4">
          <select
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            className="rounded-md border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
          >
            {activeTab === "image" ? (
              <option value="luna">LUNA</option>
            ) : (
              <>
                <option value="veo2">VEO2</option>
                <option value="luna">LUNA</option>
              </>
            )}
          </select>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          {isLoading && <p>처리 중...</p>}
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}
          {videoUrl && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="relative w-full max-w-5xl aspect-video overflow-hidden rounded-lg shadow-lg">
                <video
                  src={videoUrl}
                  controls
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}