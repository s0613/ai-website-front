// componets/video/main.tsx
"use client";

import React, { useState } from "react";
// import { useRouter } from "next/navigation";  <-- (1) router 미사용 시 주석 처리/삭제
import Image from "next/image";
import { FiLoader } from "react-icons/fi";

export default function VideoGenerationPage() {
  // const router = useRouter();                 <-- (1) 사용하지 않으면 제거

  // 입력받는 값(프롬프트, 이미지)
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 생성 결과 (영상 URL), 로딩/에러 상태
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 이미지 미리보기
  const [previewUrl, setPreviewUrl] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setVideoUrl("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/generate-video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("영상 생성에 실패했습니다.");
      }

      const data = await res.json();
      setVideoUrl(data.videoUrl || "");
    } 
    catch (err: unknown) {  // <-- (2) no-explicit-any 대신 unknown 사용
      if (err instanceof Error) {
        setErrorMessage(err.message || "알 수 없는 오류가 발생했습니다.");
      } else {
        setErrorMessage("알 수 없는 오류가 발생했습니다.");
      }
    } 
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 프롬프트 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            프롬프트
          </label>
          <input
            type="text"
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 바닷가에서 춤추는 로봇"
            className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 이미지 업로드(선택) */}
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
        </div>

        {/* 이미지 미리보기 */}
        {previewUrl && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-1">미리보기:</p>
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

        {/* 생성 버튼 */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <FiLoader className="animate-spin" />
                <span>생성 중...</span>
              </div>
            ) : (
              "영상 생성하기"
            )}
          </button>
        </div>
      </form>

      {/* 오류 메시지 */}
      {errorMessage && (
        <p className="mt-4 text-red-600 font-medium">{errorMessage}</p>
      )}

      {/* 결과 영상 표시 */}
      {videoUrl && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">생성된 영상</h2>
          <video
            src={videoUrl}
            controls
            className="w-full max-w-md border rounded-md"
          />
        </div>
      )}
    </div>
  );
}
