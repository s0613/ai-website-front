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
import {
  Upload,
  CheckCircle,
  ArrowUpToLine,
  Loader2,
  Film,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import ModelSetting from "./ModelSetting";
import { SidebarFormData, useVideoSidebar } from "../hooks/useVideoSidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="w-[360px] h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-sm">
      <ScrollArea className="flex-1">
        <div className="p-5 pb-6">
          {/* 탭 선택 영역 */}
          <div className="mb-6">
            <Tabs
              defaultValue={activeTab}
              onValueChange={(val) => handleTabSelection(val as any)}
            >
              <TabsList className="grid grid-cols-3 w-full bg-gray-100/80 p-0.5 rounded-lg">
                <TabsTrigger
                  value="image"
                  className="flex items-center gap-1.5 py-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 shadow-none data-[state=active]:shadow-sm"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>이미지</span>
                </TabsTrigger>
                <TabsTrigger
                  value="video"
                  className="flex items-center gap-1.5 py-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 shadow-none data-[state=active]:shadow-sm"
                >
                  <Film className="w-4 h-4" />
                  <span>비디오</span>
                </TabsTrigger>
                <TabsTrigger
                  value="text"
                  className="flex items-center gap-1.5 py-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 shadow-none data-[state=active]:shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>텍스트</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                프롬프트
              </label>
              <textarea
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 바닷가에서 춤추는 로봇"
                rows={6}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-sky-300 focus:border-sky-500 focus:outline-none resize-y transition-colors placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-500">
                자세한 설명일수록 더 좋은 결과가 나옵니다
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {activeTab === "image" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    참조 이미지
                  </label>
                  {imageChanged && (
                    <span className="text-emerald-600 text-xs flex items-center animate-pulse">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      변경됨
                    </span>
                  )}
                </div>

                {previewUrl ? (
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <div
                        className={`relative w-full h-48 border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group ${
                          imageChanged
                            ? "ring-2 ring-sky-500 shadow-lg border-sky-300"
                            : "border-gray-200 hover:border-sky-300"
                        }`}
                      >
                        <Image
                          src={previewUrl}
                          alt="참조 이미지"
                          fill
                          className="object-contain"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-medium px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                            우클릭하여 메뉴 열기
                          </p>
                        </div>
                        {imageChanged && (
                          <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs rounded-full p-1">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-40">
                      <ContextMenuItem onClick={selectImage} className="gap-2">
                        <ImageIcon className="h-4 w-4" />
                        이미지 변경
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={removeImage}
                        className="gap-2 text-red-600"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        이미지 삭제
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ) : (
                  <div
                    className="w-full h-48 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors border-gray-300 hover:border-sky-300 group"
                    onClick={selectImage}
                  >
                    <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="h-7 w-7 text-sky-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      이미지 추가하기
                    </p>
                    <p className="text-xs text-gray-500 px-6 text-center">
                      참조 이미지를 추가하면 더 정확한 결과를 얻을 수 있습니다
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                AI 모델 선택
              </label>
              <select
                value={endpoint}
                onChange={(e) => updateSettings({ endpoint: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-sky-300 focus:border-sky-500 focus:outline-none bg-white"
              >
                {activeTab === "image" ? (
                  <>
                    <option value="kling">
                      KLING - 자연스러운 동작과 고해상도, 사실적인 영상 생성.
                    </option>
                    <option value="wan">
                      WAN - 정적 이미지에 생동감 있는 움직임 추가.
                    </option>
                    <option value="hunyuan">
                      HUNYUAN - 세밀한 디테일과 복잡한 장면 표현 가능.
                    </option>
                  </>
                ) : (
                  <>
                    <option value="veo2">VEO2 - 고품질 비디오 생성</option>
                  </>
                )}
              </select>
            </div>

            {/* 모델 설정 컴포넌트 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/70">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <svg
                  className="h-4 w-4 mr-1.5 text-sky-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                모델 세부 설정
              </h3>
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
            </div>

            <div className="pt-4 space-y-3.5">
              <Button
                type="submit"
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white transition-colors shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>영상 생성 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Film className="mr-2 h-4 w-4" />
                    <span>영상 생성하기</span>
                  </div>
                )}
              </Button>

              <Button
                type="button"
                onClick={onUpscale}
                disabled={!videoGenerated || isUpscaling || hasUpscaled}
                className={`w-full py-2.5 transition-colors shadow-sm flex items-center justify-center ${
                  hasUpscaled
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : !videoGenerated
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                }`}
              >
                {isUpscaling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>업스케일링 중...</span>
                  </>
                ) : hasUpscaled ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>업스케일링 완료</span>
                  </>
                ) : (
                  <>
                    <ArrowUpToLine className="mr-2 h-4 w-4" />
                    <span>고화질 업스케일링</span>
                  </>
                )}
              </Button>

              {!videoGenerated && (
                <p className="text-xs text-gray-500 text-center">
                  영상을 먼저 생성해주세요
                </p>
              )}
            </div>
          </form>
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center text-xs text-gray-500 justify-center">
          <svg
            className="h-3 w-3 mr-1 text-sky-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          모든 생성된 콘텐츠는 저작권이 사용자에게 있습니다
        </div>
      </div>
    </div>
  );
}
