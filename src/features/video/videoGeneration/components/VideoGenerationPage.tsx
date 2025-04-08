"use client";

import React from "react";
import { RefreshCw, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import VideoSidebar from "./VideoSidebar";
import VideoGenerationFolder from "./VideoGenerationFolder";
import useVideoGeneration from "../hooks/useVideoGeneration";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

export default function VideoGenerationPage() {
  const {
    videoUrl,
    errorMessage,
    isLoading,
    isSaving,
    saveSuccess,
    saveError,
    isUpscaling,
    upscaledVideoUrl,
    activeTab,
    selectedEndpoint,
    setSelectedEndpoint,
    quality,
    setQuality,
    style,
    setStyle,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
    handleSidebarSubmit,
    handleUpscaleVideo,
    handleTabChange,
    handleAddReferenceImage,
    handleImageChange,
    fileInputRef,
  } = useVideoGeneration();

  // VideoSidebar의 onTabChange 타입에 맞게 래퍼 함수 생성
  const handleVideoTabChange = (tab: "image" | "text" | "video") => {
    if (tab === "image" || tab === "text") {
      handleTabChange(tab);
    }
  };

  // handleSidebarSubmit 함수 호출을 위한 래퍼 함수
  const handleVideoSidebarSubmit = (data: any) => {
    handleSidebarSubmit(data);
  };

  // 이미지 선택 핸들러
  const handleSelectImage = (fileUrl: string, fileName: string) => {
    handleAddReferenceImage({ fileUrl, name: fileName });
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden fixed inset-0 pt-16">
      <VideoSidebar
        onSubmit={handleVideoSidebarSubmit}
        onTabChange={handleVideoTabChange}
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
        {videoUrl ? (
          <Card className="m-8 p-6 border border-white/20 bg-black/40 backdrop-blur-xl">
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
                <video
                  src={upscaledVideoUrl || videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full rounded-lg"
                />
                <div className="absolute top-2 right-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full border border-white/10"
                          onClick={() => {
                            const videoElement = document.querySelector("video");
                            if (videoElement) {
                              videoElement.currentTime = 0;
                              videoElement.play();
                            }
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="sr-only">다시 재생</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black/80 backdrop-blur-md border border-white/10 text-white">
                        다시 재생
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center space-y-3">
                {!isUpscaling && !upscaledVideoUrl && (
                  <Button
                    onClick={handleUpscaleVideo}
                    className="bg-sky-500 hover:bg-sky-600 text-white"
                    disabled={isUpscaling}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    고해상도로 변환하기
                  </Button>
                )}

                {isUpscaling && (
                  <div className="flex items-center text-sky-500 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    고해상도 변환 중...
                  </div>
                )}

                {isSaving && (
                  <div className="text-sky-500 flex items-center bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    비디오 저장 중...
                  </div>
                )}

                {saveSuccess && (
                  <div className="text-sky-500 flex items-center bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    비디오가 내 보관함에 저장되었습니다
                  </div>
                )}

                {saveError && (
                  <div className="text-red-400 flex items-center bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {saveError}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <VideoGenerationFolder onSelectImage={handleSelectImage} />
        )}
      </div>
    </div>
  );
}
