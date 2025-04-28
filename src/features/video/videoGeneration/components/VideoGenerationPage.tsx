"use client";

import React from "react";
import VideoSidebar from "./VideoSidebar";
import VideoGenerationFolder from "./VideoGenerationFolder";
import useVideoGeneration from "../hooks/useVideoGeneration";
import { toast } from "react-hot-toast";

export default function VideoGenerationPage() {
  const {
    videoUrl,
    isLoading,
    isUpscaling,
    upscaledVideoUrl,
    activeTab,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
    handleSidebarSubmit,
    handleUpscaleVideo,
    handleTabChange,
    handleAddReferenceImage,
  } = useVideoGeneration();

  // handleSidebarSubmit 함수 호출을 위한 래퍼 함수
  const handleVideoSidebarSubmit = (data: any) => {
    handleSidebarSubmit(data);
    // 영상 생성 시작 알림
    toast.success("영상 생성이 시작되었습니다. 생성이 완료되면 알림으로 알려드리겠습니다.", {
      duration: 5000,
    });
  };

  // 이미지 선택 핸들러
  const handleSelectImage = (fileUrl: string, fileName: string) => {
    handleAddReferenceImage({ fileUrl, name: fileName });
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden fixed inset-0 pt-16">
      <VideoSidebar
        onSubmit={handleVideoSidebarSubmit}
        onTabChange={handleTabChange}
        referenceImageFile={referenceImageFile}
        referenceImageUrl={referenceImageUrl}
        referencePrompt={referencePrompt}
        referenceModel={referenceModel}
        onUpscale={handleUpscaleVideo}
        isUpscaling={isUpscaling}
        hasUpscaled={!!upscaledVideoUrl}
        videoGenerated={!!videoUrl}
        isLoading={isLoading}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VideoGenerationFolder onSelectImage={handleSelectImage} />
      </div>
    </div>
  );
}
