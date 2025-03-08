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
import { Image as FileImage } from "lucide-react";

export type SidebarFormData = {
  prompt: string;
  imageFile: File | null;
  aspectRatio: string;
  duration: string;
  endpoint: string;
  quality: "standard" | "high";
  style: "realistic" | "creative";
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
  const [endpoint, setEndpoint] = useState(
    activeTab === "image" ? "luna" : "veo2"
  );
  const [quality, setQuality] = useState<"standard" | "high">("standard");
  const [style, setStyle] = useState<"realistic" | "creative">("realistic");
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
    onSubmit({
      prompt,
      imageFile,
      aspectRatio,
      duration,
      endpoint,
      quality,
      style,
    });
  };

  const handleTabSelection = (tab: "image" | "text") => {
    setActiveTab(tab);
    onTabChange(tab);
    // 탭 변경 시 적절한 기본 엔드포인트 설정
    if (tab === "image") {
      setEndpoint("luna");
    } else {
      setEndpoint("veo2");
    }
  };

  // 이미지를 선택하는 함수
  const selectImage = () => {
    fileInputRef.current?.click();
  };

  return (
    // 컨트롤 패널 헤더를 제거하고 바로 스크롤 영역으로 시작
    <div className="w-[260px] h-full bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
      {/* 스크롤 영역 - ScrollArea 컴포넌트 사용 */}
      <ScrollArea className="flex-1">
        <div className="p-3 pb-6">
          {/* 탭 전환 버튼 - 더 컴팩트하게 변경 */}
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
            {/* 프롬프트 입력 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                프롬프트
              </label>
              <textarea
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 바닷가에서 춤추는 로봇"
                rows={4}
                className="block w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 resize-y"
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

            {/* 이미지 선택 영역 (이미지 탭에서만 보임) */}
            {activeTab === "image" && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  참조 이미지
                </label>
                {previewUrl ? (
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <div className="relative w-full h-28 border rounded-md overflow-hidden cursor-pointer">
                        <Image
                          src={previewUrl}
                          alt="미리보기"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs">우클릭하여 옵션</p>
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={selectImage}>
                        이미지 변경
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => {
                          setImageFile(null);
                          setPreviewUrl("");
                        }}
                      >
                        이미지 삭제
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ) : (
                  <div
                    className="w-full h-28 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
                    onClick={selectImage}
                  >
                    <FileImage className="h-6 w-6 text-gray-400" />
                    <p className="mt-1 text-xs text-gray-500">
                      이미지 추가하기
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 옵션: 비율 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                비율
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["16:9", "9:16"].map((ratio) => (
                  <label
                    key={ratio}
                    className={`flex items-center justify-center py-1.5 rounded border cursor-pointer text-xs ${
                      aspectRatio === ratio
                        ? "bg-blue-100 border-blue-400 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="aspectRatio"
                      value={ratio}
                      checked={aspectRatio === ratio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="sr-only"
                    />
                    {ratio}
                  </label>
                ))}
              </div>
            </div>

            {/* 옵션: 길이 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                길이
              </label>
              <div className="grid grid-cols-4 gap-1">
                {["5s", "6s", "7s", "8s"].map((dur) => (
                  <label
                    key={dur}
                    className={`flex items-center justify-center py-1 rounded border cursor-pointer text-xs ${
                      duration === dur
                        ? "bg-blue-100 border-blue-400 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={dur}
                      checked={duration === dur}
                      onChange={(e) => setDuration(e.target.value)}
                      className="sr-only"
                    />
                    {dur}
                  </label>
                ))}
              </div>
            </div>

            {/* 옵션: API 엔드포인트 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                API 엔드포인트
              </label>
              <select
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
                disabled={activeTab === "image"}
              >
                {activeTab === "image" ? (
                  <option value="luna">LUNA</option>
                ) : (
                  <>
                    <option value="veo2">VEO2</option>
                    <option value="luna">LUNA</option>
                  </>
                )}
              </select>
            </div>

            {/* 옵션: 품질 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                품질
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "standard", label: "표준" },
                  { value: "high", label: "고품질" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center py-1.5 rounded border cursor-pointer text-xs ${
                      quality === option.value
                        ? "bg-blue-100 border-blue-400 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="quality"
                      value={option.value}
                      checked={quality === option.value}
                      onChange={() =>
                        setQuality(option.value as "standard" | "high")
                      }
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* 옵션: 스타일 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                스타일
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "realistic", label: "사실적" },
                  { value: "creative", label: "창의적" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center py-1.5 rounded border cursor-pointer text-xs ${
                      style === option.value
                        ? "bg-blue-100 border-blue-400 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="style"
                      value={option.value}
                      checked={style === option.value}
                      onChange={() =>
                        setStyle(option.value as "realistic" | "creative")
                      }
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full mt-4">
              영상 생성
            </Button>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
