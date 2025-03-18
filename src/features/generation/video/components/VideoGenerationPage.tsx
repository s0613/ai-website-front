// components/VideoGenerationPage.tsx
"use client";

import React from "react";
import VideoSidebar, { SidebarFormData } from "./VideoSidebar";
import FolderSidebar, { FileItem } from "../components/FolderSidebar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, ArrowUpToLine } from "lucide-react";
import { toast } from "react-hot-toast";
import useVideoGeneration from "../hooks/useVideoGeneration";

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
    setActiveTab,
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
    selectImage,
    removeImage,
  } = useVideoGeneration();

  return (
    <div className="flex w-screen h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
      {/* 왼쪽: VideoSidebar (영상 생성 옵션) */}
      <div className="h-full">
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
      <div className="flex-1 h-full flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-4xl h-full flex flex-col">
          <div className="flex-1 bg-white rounded-xl shadow-md flex flex-col items-center justify-center overflow-hidden">
            {isLoading && (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p>비디오 생성 중...</p>
              </div>
            )}
            {errorMessage && !isLoading && (
              <div className="text-center p-6">
                <div className="text-red-600 mb-2">⚠️</div>
                <p className="text-red-600 whitespace-pre-line">
                  {errorMessage}
                </p>
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
              <div className="w-full h-full flex flex-col items-center justify-center">
                <video
                  src={upscaledVideoUrl || videoUrl}
                  controls
                  autoPlay
                  loop
                  className="max-w-full max-h-[80%] rounded-lg shadow-lg"
                />
                <div className="mt-4 flex flex-col items-center space-y-2">
                  {isSaving && (
                    <div className="text-center text-blue-600">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                      비디오 저장 중...
                    </div>
                  )}
                  {saveSuccess && (
                    <div className="text-green-600 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
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
                    <div className="text-red-600 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
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
            )}
          </div>
        </div>
      </div>

      {/* 오른쪽: FolderSidebar (폴더/파일 목록) */}
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
