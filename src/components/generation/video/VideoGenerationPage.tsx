"use client";

import React, { useState } from "react";
import VideoSidebar, { SidebarFormData } from "./VideoSidebar";
import VideoSetting from "./FolderSidebar";

export default function VideoGenerationPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");
  const [selectedEndpoint, setSelectedEndpoint] = useState("luna");
  const [quality, setQuality] = useState<"standard" | "high">("standard");
  const [style, setStyle] = useState<"realistic" | "creative">("realistic");

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
        endpoint = data.imageFile
          ? "/api/video/luma/image"
          : "/api/video/luma/text";
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
        quality?: string;
        style?: string;
      } = {
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        duration: data.duration,
        quality,
        style,
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
    } catch {
      setErrorMessage("오류 발생");
    } finally {
      setIsLoading(false);
    }
  };

  // 업데이트된 activeTab를 VideoSidebar에서 받아오기 위한 핸들러
  const handleTabChange = (tab: "image" | "text") => {
    setActiveTab(tab);
    // 이미지 탭이면 luna만 옵션, 텍스트 탭이면 veo2와 luna 선택 옵션 제공
    if (tab === "image") {
      setSelectedEndpoint("luna");
    } else {
      // 기본값 텍스트 탭은 veo2 선택
      setSelectedEndpoint("veo2");
    }
  };

  return (
    // Navbar 아래에 위치하도록 fixed를 제거하고 pt-16(Navbar 높이)를 추가
    <div className="flex w-screen h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
      {/* 왼쪽: 컨트롤 패널 */}
      <div className="h-full">
        <VideoSidebar
          onSubmit={handleSidebarSubmit}
          onTabChange={handleTabChange}
        />
      </div>

      {/* 중앙: 비디오 미리보기 영역 - 스크롤 없이 고정 */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-4xl h-full flex flex-col">
          {/* 비디오 컨테이너 */}
          <div className="flex-1 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden">
            {isLoading && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p>비디오 생성 중...</p>
              </div>
            )}
            {errorMessage && (
              <div className="text-center p-6">
                <div className="text-red-600 mb-2">⚠️</div>
                <p className="text-red-600">{errorMessage}</p>
              </div>
            )}
            {!videoUrl && !isLoading && !errorMessage && (
              <div className="text-center p-6">
                <p className="text-gray-600 text-2xl font-medium">
                  상상을 현실로 만들어보세요
                </p>
                <p className="text-gray-400 text-lg mb-2">
                  Create your imagination into reality
                </p>
              </div>
            )}
            {videoUrl && (
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                className="max-w-full max-h-full rounded-lg shadow-lg"
              />
            )}
          </div>
        </div>
      </div>

      {/* 오른쪽: 설정 패널 - VideoSetting 컴포넌트로 대체 */}
      <VideoSetting
        activeTab={activeTab}
        selectedEndpoint={selectedEndpoint}
        quality={quality}
        style={style}
        onEndpointChange={setSelectedEndpoint}
        onQualityChange={setQuality}
        onStyleChange={setStyle}
      />
    </div>
  );
}
