"use client";

import React from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, ArrowUpToLine, Loader2 } from "lucide-react";
import ModelSetting from "./ModelSetting";
import { SidebarFormData, useVideoSidebar } from "../hooks/useVideoSidebar";

export type VideoSidebarProps = {
  onSubmit: (data: SidebarFormData) => void;
  onTabChange: (tab: "image" | "text" | "video") => void;
  referenceImageFile?: File | null;
  referenceImageUrl?: string;
  referencePrompt?: string;
  referenceModel?: string;
  onUpscale?: () => Promise<void>;
  isUpscaling?: boolean;
  hasUpscaled?: boolean;
  videoGenerated?: boolean;
  isLoading?: boolean;
};

export default function VideoSidebar(props: VideoSidebarProps) {
  const {
    onSubmit,
    onTabChange,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
    onUpscale,
    isUpscaling,
    hasUpscaled,
    videoGenerated,
    isLoading,
  } = props;

  const {
    prompt,
    setPrompt,
    previewUrl,
    activeTab,
    aspectRatio,
    duration,
    endpoint,
    imageChanged,
    cameraControl,
    seed,
    resolution,
    numFrames,
    updateSettings,
    handleSubmit,
    handleImageChange,
    handleTabSelection,
    selectImage,
    removeImage,
    fileInputRef,
  } = useVideoSidebar({
    onSubmit,
    onTabChange,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
  });

  return (
    <div className="w-[360px] h-full bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-3 pb-6">
          <div className="mb-4 flex rounded-md overflow-hidden border border-gray-200">
            <button
              type="button"
              onClick={() => handleTabSelection("image")}
              className={`flex-1 py-1.5 text-sm ${
                activeTab === "image"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              이미지
            </button>
            <button
              type="button"
              onClick={() => handleTabSelection("video")}
              className={`flex-1 py-1.5 text-sm ${
                activeTab === "video"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              비디오
            </button>
            <button
              type="button"
              onClick={() => handleTabSelection("text")}
              className={`flex-1 py-1.5 text-sm ${
                activeTab === "text"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              텍스트
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">
                프롬프트
              </label>
              <textarea
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 바닷가에서 춤추는 로봇"
                rows={7}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 resize-y"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {activeTab === "image" && (
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 flex items-center justify-between">
                  참조 이미지
                  {imageChanged && (
                    <span className="text-green-500 text-xs flex items-center animate-pulse">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      변경됨
                    </span>
                  )}
                </label>
                {previewUrl ? (
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <div
                        className={`relative w-full h-48 border rounded-md overflow-hidden cursor-pointer transition-all duration-300 ${
                          imageChanged ? "ring-2 ring-green-500 shadow-lg" : ""
                        }`}
                      >
                        <Image
                          src={previewUrl}
                          alt="미리보기"
                          fill
                          className="object-contain"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs">우클릭 메뉴</p>
                        </div>
                        {imageChanged && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs rounded-full p-1">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={selectImage}>
                        이미지 변경
                      </ContextMenuItem>
                      <ContextMenuItem onClick={removeImage}>
                        이미지 삭제
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ) : (
                  <div
                    className="w-full h-48 border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors border-gray-300"
                    onClick={selectImage}
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      이미지 추가하기
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      클릭하여 파일 선택 또는 오른쪽 이미지에서 + 버튼 사용
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1">
                API 엔드포인트
              </label>
              <select
                value={endpoint}
                onChange={(e) => updateSettings({ endpoint: e.target.value })}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {activeTab === "image" ? (
                  <>
                    <option value="kling">KLING</option>
                    <option value="wan">WAN</option>
                    <option value="hunyuan">HUNYUAN</option>
                  </>
                ) : (
                  <>
                    <option value="veo2">VEO2</option>
                  </>
                )}
              </select>
            </div>

            {/* 모델 설정 컴포넌트 */}
            <ModelSetting
              endpoint={endpoint}
              updateSettings={updateSettings}
              currentSettings={{
                aspectRatio,
                duration,
                cameraControl,
                seed,
                resolution,
                numFrames,
              }}
            />

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  영상 생성 중...
                </>
              ) : (
                "영상 생성"
              )}
            </Button>

            <div className="mt-3">
              <Button
                type="button"
                onClick={onUpscale}
                disabled={!videoGenerated || isUpscaling || hasUpscaled}
                className={`w-full flex items-center justify-center ${
                  hasUpscaled
                    ? "bg-green-600 hover:bg-green-700"
                    : !videoGenerated
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isUpscaling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    업스케일링 중...
                  </>
                ) : hasUpscaled ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    업스케일링 완료
                  </>
                ) : (
                  <>
                    <ArrowUpToLine className="mr-2 h-4 w-4" />
                    고화질 업스케일링
                  </>
                )}
              </Button>

              {!videoGenerated && (
                <p className="text-xs text-gray-500 mt-1 text-center">
                  영상을 먼저 생성해주세요
                </p>
              )}
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
