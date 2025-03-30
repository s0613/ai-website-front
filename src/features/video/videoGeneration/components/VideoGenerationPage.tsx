"use client";

import React, { useMemo } from "react";
import { RefreshCw, Sparkles, Film, Loader2 } from "lucide-react";
import VideoSidebar from "./VideoSidebar";
import FolderSidebar from "./FolderSidebar";
import useVideoGeneration from "../hooks/useVideoGeneration";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // 현재 상태에 따른 비디오 미리보기 영역 렌더링 내용 결정
  const renderPreviewContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="text-center flex flex-col items-center justify-center p-10">
          <div className="relative mb-6">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
            <div className="absolute inset-0 rounded-full border-t-2 border-sky-500 animate-ping opacity-20"></div>
          </div>
          <p className="text-gray-700 font-medium text-xl mb-1">
            비디오 생성 중...
          </p>
          <p className="text-gray-500 text-sm max-w-sm text-center">
            고품질 AI 비디오를 생성하는 데 약 30초에서 2분이 소요됩니다.
          </p>
        </div>
      );
    }

    if (errorMessage && !isLoading) {
      return (
        <div className="text-center p-8 max-w-lg">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 text-red-500">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            비디오 생성에 실패했습니다
          </h3>
          <p className="text-red-600 whitespace-pre-line mb-4 text-sm">
            {errorMessage}
          </p>
          <Button
            onClick={() => handleSidebarSubmit()}
            className="bg-sky-500 hover:bg-sky-600 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            다시 시도하기
          </Button>
        </div>
      );
    }

    if (!videoUrl && !isLoading && !errorMessage) {
      return (
        <div className="text-center p-8 flex flex-col items-center justify-center">
          <div className="w-20 h-20 mb-6 flex items-center justify-center rounded-full bg-sky-50 text-sky-500">
            <Film className="w-10 h-10" />
          </div>
          <h2 className="text-gray-800 text-2xl font-bold mb-2">
            상상을 <span className="text-sky-500">현실</span>로 만들어보세요
          </h2>
          <p className="text-gray-500 text-lg mb-6 max-w-md">
            텍스트나 이미지로부터 놀라운 비디오를 생성해보세요
          </p>
        </div>
      );
    }

    if (videoUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          <div className="relative rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-1 w-full max-w-2xl">
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
                      className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full"
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
                  <TooltipContent>다시 재생</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center space-y-2">
            {!isUpscaling && !upscaledVideoUrl && (
              <Button
                onClick={handleUpscaleVideo}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-6"
                disabled={isUpscaling}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                고해상도로 변환하기
              </Button>
            )}

            {isUpscaling && (
              <div className="flex items-center text-sky-600 bg-sky-50 px-4 py-2 rounded-full">
                <div className="animate-spin h-4 w-4 border-2 border-sky-600 border-t-transparent rounded-full mr-2"></div>
                고해상도 변환 중...
              </div>
            )}

            {isSaving && (
              <div className="text-sky-600 flex items-center bg-sky-50 px-4 py-2 rounded-full">
                <div className="animate-spin h-4 w-4 border-2 border-sky-600 border-t-transparent rounded-full mr-2"></div>
                비디오 저장 중...
              </div>
            )}

            {saveSuccess && (
              <div className="text-green-600 flex items-center bg-green-50 px-4 py-2 rounded-full">
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
              <div className="text-red-600 flex items-center bg-red-50 px-4 py-2 rounded-full">
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

  return (
    <div className="flex w-screen h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200">
      {/* 왼쪽: VideoSidebar (영상 생성 옵션) */}
      <div className="h-full border-r border-gray-200 bg-white shadow-sm z-10">
        <VideoSidebar
          onSubmit={handleSidebarSubmit}
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
      </div>

      {/* 중앙: 영상 미리보기 */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-6 overflow-auto">
        <div className="w-full max-w-4xl h-full flex flex-col">
          <div className="flex-1 bg-white rounded-xl shadow-md flex flex-col items-center justify-center overflow-hidden border border-gray-200/80 backdrop-blur-sm bg-white/90">
            {renderPreviewContent}
          </div>
        </div>
      </div>

      {/* 오른쪽: FolderSidebar (폴더/파일 목록) */}
      <div className="h-full border-l border-gray-200 bg-white shadow-sm z-10">
        <FolderSidebar
          activeTab={activeTab}
          selectedEndpoint={selectedEndpoint}
          quality={quality}
          style={style}
          onEndpointChange={setSelectedEndpoint}
          onQualityChange={setQuality}
          onStyleChange={setStyle}
          onAddReferenceImage={handleAddReferenceImage}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
}
