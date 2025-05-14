"use client";

import React, { Suspense } from "react";
import VideoSidebar from "./VideoSidebar";
import VideoGenerationFolder from "./VideoGenerationFolder";
import useVideoGeneration from "../hooks/useVideoGeneration";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { SidebarFormData } from "../hooks/useVideoSidebar";

// 로딩 컴포넌트
function LoadingComponent() {
  return <div className="p-4 text-white">로딩 중...</div>;
}

// 실제 비디오 생성 페이지 내용을 담당하는 컴포넌트
function VideoGenerationContent() {
  const searchParams = useSearchParams();

  const {
    videoUrl,
    isUpscaling,
    upscaledVideoUrl,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
    handleSidebarSubmit,
    handleUpscaleVideo,
    handleTabChange,
    handleAddReferenceImage,
  } = useVideoGeneration({ searchParams });

  // handleSidebarSubmit 함수 호출을 위한 래퍼 함수
  const handleVideoSidebarSubmit = (data: SidebarFormData) => {
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
        isLoading={false}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VideoGenerationFolder onSelectImage={handleSelectImage} />
      </div>
    </div>
  );
}

// 메인 비디오 생성 페이지 컴포넌트
export default function VideoGenerationPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <VideoGenerationContent />
    </Suspense>
  );
}
