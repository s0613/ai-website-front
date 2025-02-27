"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Image as FileImage, FilePlus } from "lucide-react";

export type SidebarFormData = {
  prompt: string;
  imageFile: File | null;
  aspectRatio: string;
  duration: string;
};

export default function VideoSidebar({
  onSubmit,
  onTabChange,
}: {
  onSubmit: (data: SidebarFormData) => void;
  onTabChange: (tab: "image" | "text") => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState("5s");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ prompt, imageFile, aspectRatio, duration });
  };

  const handleTabChange = (tab: "image" | "text") => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  // 이미지를 선택하는 함수
  const selectImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-[320px] h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      <ScrollArea className="p-4 flex-1">
        {/* 탭 전환 영역 */}
        <div className="mb-4 flex space-x-2">
          <button
            type="button"
            onClick={() => handleTabChange("image")}
            className={`px-4 py-2 rounded ${
              activeTab === "image"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Image to Video
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("text")}
            className={`px-4 py-2 rounded ${
              activeTab === "text"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Text to Video
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 프롬프트 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              프롬프트
            </label>
            <textarea
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 바닷가에서 춤추는 로봇"
              rows={6}
              className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:border-blue-500 resize-y"
            />
          </div>

          {/* 숨겨진 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* 이미지 미리보기 영역 */}
          {activeTab === "image" && (
            <div className="mb-4">
              {previewUrl ? (
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div className="relative w-full h-40 border rounded-md overflow-hidden cursor-pointer">
                      <Image
                        src={previewUrl}
                        alt="미리보기"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm">우클릭하여 이미지 옵션</p>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={selectImage}>이미지 변경</ContextMenuItem>
                    <ContextMenuItem onClick={() => {
                      setImageFile(null);
                      setPreviewUrl("");
                    }}>
                      이미지 삭제
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ) : (
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div 
                      className="w-full h-40 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
                      onClick={selectImage}
                    >
                      <FileImage className="h-10 w-10 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">이미지를 선택하려면 클릭하세요</p>
                      <p className="text-xs text-gray-400">또는 우클릭하여 옵션 확인</p>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={selectImage}>
                      <FilePlus className="mr-2 h-4 w-4" />
                      이미지 선택하기
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              )}
            </div>
          )}

          {/* 옵션: 비율 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비율
            </label>
            <div className="flex space-x-4">
              {["16:9", "9:16"].map((ratio) => (
                <label key={ratio} className="flex items-center">
                  <input
                    type="radio"
                    name="aspectRatio"
                    value={ratio}
                    checked={aspectRatio === ratio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="mr-2"
                  />
                  {ratio}
                </label>
              ))}
            </div>
          </div>

          {/* 옵션: 길이 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              길이
            </label>
            <div className="flex space-x-4">
              {["5s", "6s", "7s", "8s"].map((dur) => (
                <label key={dur} className="flex items-center">
                  <input
                    type="radio"
                    name="duration"
                    value={dur}
                    checked={duration === dur}
                    onChange={(e) => setDuration(e.target.value)}
                    className="mr-2"
                  />
                  {dur}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            영상 생성
          </Button>
        </form>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        © 2023 AI Image Site
      </div>
    </div>
  );
}