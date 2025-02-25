"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  return (
    <div className="w-[320px] h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      <ScrollArea className="p-4 flex-1">
        {/* 탭 전환 영역 */}
        <div className="mb-4 flex space-x-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("image");
              onTabChange("image");
            }}
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
            onClick={() => {
              setActiveTab("text");
              onTabChange("text");
            }}
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

          {/* Image 탭인 경우 이미지 업로드 */}
          {activeTab === "image" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이미지 업로드 (선택)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:border-0 file:rounded-md file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">미리보기</p>
                  <div className="relative w-40 h-40">
                    <Image
                      src={previewUrl}
                      alt="미리보기"
                      fill
                      className="object-cover rounded-md border"
                    />
                  </div>
                </div>
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

          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              영상 생성
            </button>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
}