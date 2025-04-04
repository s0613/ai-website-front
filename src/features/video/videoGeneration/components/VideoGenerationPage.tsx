"use client";

import React, { useMemo } from "react";
import { RefreshCw, Sparkles, Film, Loader2 } from "lucide-react";
import VideoSidebar from "./VideoSidebar";
import VideoFeed from "./VideoFeed";
import FolderSidebar from "./FolderSidebar";
import useVideoGeneration from "../hooks/useVideoGeneration";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileItem } from "../../types/fileTypes";
import { toast } from "react-hot-toast";

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

  // 현재 상태에 따른 비디오 미리보기 영역 렌더링
  const renderPreviewContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="text-center flex flex-col items-center justify-center p-10">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10">
            <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
          </div>
          <p className="text-white font-medium text-xl mb-1">
            비디오 생성 중...
          </p>
          <p className="text-gray-400 text-sm max-w-sm text-center">
            고품질 AI 비디오를 생성하는 데 약 30초에서 2분이 소요됩니다.
          </p>
        </div>
      );
    }

    if (errorMessage && !isLoading) {
      return (
        <div className="text-center p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-red-500 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            비디오 생성에 실패했습니다
          </h3>
          <p className="text-red-400 whitespace-pre-line mb-4 text-sm">
            {errorMessage}
          </p>
          <Button
            onClick={() => handleVideoSidebarSubmit({})}
            className="bg-sky-500/20 backdrop-blur-md hover:bg-sky-500/30 text-white flex items-center gap-2 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도하기
          </Button>
        </div>
      );
    }

    if (!videoUrl && !isLoading && !errorMessage) {
      return <VideoFeed />;
    }

    if (videoUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 overflow-hidden">
          <div
            className="
            relative 
            rounded-lg 
            overflow-hidden 
            shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
            border 
            border-white/20 
            bg-black/40 
            backdrop-blur-xl 
            p-1 
            w-full 
            max-w-2xl
          "
          >
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
                      className="h-8 w-8 p-0 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
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
                  <TooltipContent className="bg-black/80 backdrop-blur-md border border-white/10 text-white">다시 재생</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center space-y-2">
            {!isUpscaling && !upscaledVideoUrl && (
              <Button
                onClick={handleUpscaleVideo}
                className="
                  bg-sky-500/20 
                  backdrop-blur-md 
                  hover:bg-sky-500/30 
                  text-white 
                  px-6
                  border 
                  border-white/10 
                  shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                "
                disabled={isUpscaling}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                고해상도로 변환하기
              </Button>
            )}

            {isUpscaling && (
              <div className="flex items-center text-sky-500 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="animate-spin h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full mr-2"></div>
                고해상도 변환 중...
              </div>
            )}

            {isSaving && (
              <div className="text-sky-500 flex items-center bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <div className="animate-spin h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full mr-2"></div>
                비디오 저장 중...
              </div>
            )}

            {saveSuccess && (
              <div className="text-sky-500 flex items-center bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
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
              <div className="text-red-400 flex items-center bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                {saveError}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  }, [
    videoUrl,
    errorMessage,
    isLoading,
    isUpscaling,
    upscaledVideoUrl,
    isSaving,
    saveSuccess,
    saveError,
    handleSidebarSubmit,
    handleUpscaleVideo,
  ]);

  // VideoSidebar의 onTabChange 타입에 맞게 래퍼 함수 생성
  const handleVideoTabChange = (tab: "image" | "text" | "video") => {
    if (tab === "image" || tab === "text") {
      handleTabChange(tab);
    }
  };

  // FolderSidebar의 onAddReferenceImage 타입에 맞게 래퍼 함수 생성
  const handleFolderAddReferenceImage = (file: FileItem) => {
    if (file.fileUrl) {
      handleAddReferenceImage({ fileUrl: file.fileUrl, name: file.name });
      toast.success("참조 이미지로 설정되었습니다");
    }
  };

  // handleSidebarSubmit 함수 호출을 위한 래퍼 함수
  const handleVideoSidebarSubmit = (data: any) => {
    handleSidebarSubmit(data);
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
        <div className="flex-1 overflow-hidden relative flex items-center justify-center">
          {renderPreviewContent}
        </div>
      </div>
      <FolderSidebar
        onFileSelect={() => { }}
        onDownload={() => { }}
        onDelete={() => { }}
        onAddReferenceImage={handleFolderAddReferenceImage}
        selectedEndpoint={selectedEndpoint}
        quality={quality}
        style={style}
        onEndpointChange={setSelectedEndpoint}
        onQualityChange={setQuality}
        onStyleChange={setStyle}
        activeTab={activeTab}
        className="w-[280px] h-full bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
      />
    </div>
  );
}
