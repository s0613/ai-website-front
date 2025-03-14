"use client";

import React, { useState } from "react";
import VideoSidebar, { SidebarFormData } from "./VideoSidebar";
import FolderSidebar, { FileItem } from "./FolderSidebar";

export default function VideoGenerationPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // 왼쪽 사이드바(=VideoSidebar)에서 선택한 탭 ("image" | "text")
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");

  // 오른쪽 FolderSidebar를 위한 state
  const [selectedEndpoint, setSelectedEndpoint] = useState("luna");
  const [quality, setQuality] = useState<"standard" | "high">("standard");
  const [style, setStyle] = useState<"realistic" | "creative">("realistic");

  // + 버튼 통해 올라온 참조이미지
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(
    null
  );
  const [referenceImageUrl, setReferenceImageUrl] = useState("");

  // VideoSidebar -> onSubmit
  const handleSidebarSubmit = async (data: SidebarFormData) => {
    setErrorMessage("");
    setVideoUrl("");
    setIsLoading(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      let endpointUrl = "";
      // 엔드포인트별 URL 설정
      if (data.endpoint === "veo2") {
        endpointUrl = "/api/video/veo2";
      } else if (data.endpoint === "luna") {
        endpointUrl =
          data.imageFile || data.fileUrl
            ? "/api/video/luna/image"
            : "/api/video/luna/text";
      } else if (data.endpoint === "kling") {
        endpointUrl = "/api/video/kling";
      } else if (data.endpoint === "wan") {
        endpointUrl = "/api/video/wan";
      }

      let imageBase64 = "";
      if (data.imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(data.imageFile);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              imageBase64 = reader.result;
            }
            resolve(null);
          };
        });
      }

      const payload: {
        prompt: string;
        imageUrl?: string;
        aspectRatio: string;
        duration: string;
        quality?: string;
        style?: string;
      } = {
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        duration: data.duration,
        quality: data.quality,
        style: data.style,
      };

      if (!data.imageFile && data.fileUrl) {
        payload.imageUrl = data.fileUrl;
      } else if (imageBase64) {
        payload.imageUrl = imageBase64;
      }

      const res = await fetch(endpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "영상 생성 실패");
      }

      const result = await res.json();
      if (result.videoUrl) {
        setVideoUrl(result.videoUrl);
        // 비디오 URL이 생성되었을 때 저장 API 호출
        saveVideoToServer(result.videoUrl, data);
      } else {
        setErrorMessage(
          "videoUrl이 아직 생성되지 않았습니다. Job ID: " +
            JSON.stringify(result)
        );
      }
    } catch (error) {
      console.error("영상 생성 오류:", error);
      setErrorMessage(error.message ?? "오류 발생");
    } finally {
      setIsLoading(false);
    }
  };

  // 생성된 비디오를 서버에 저장하는 함수
  const saveVideoToServer = async (videoUrl: string, data: SidebarFormData) => {
    try {
      setIsSaving(true);

      // 새 API 엔드포인트 호출
      const saveResponse = await fetch("/api/my/creation/video/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: videoUrl,
          data: {
            prompt: data.prompt,
            endpoint: data.endpoint,
            fileUrl: data.fileUrl,
            imageFile: data.imageFile ? true : false, // 파일 객체는 JSON으로 직렬화할 수 없으므로 존재 여부만 전달
          },
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.message || "비디오 저장에 실패했습니다.");
      }

      setSaveSuccess(true);
    } catch (error) {
      console.error("비디오 저장 오류:", error);
      setSaveError(error.message || "비디오 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 탭 변경 시
  const handleTabChange = (tab: "image" | "text") => {
    setActiveTab(tab);
    if (tab === "image") {
      setSelectedEndpoint("luna");
    } else {
      setSelectedEndpoint("veo2");
    }
  };

  // (중요) + 버튼 클릭 시 -> fetch -> blob -> File 변환 -> state 저장
  const handleAddReferenceImage = async (fileItem: FileItem) => {
    try {
      if (!fileItem.fileUrl) {
        throw new Error("fileUrl이 존재하지 않는 파일");
      }

      setReferenceImageUrl(fileItem.fileUrl);

      const response = await fetch(fileItem.fileUrl);
      if (!response.ok) {
        throw new Error("이미지 불러오기 실패");
      }
      const blob = await response.blob();

      // 확장자
      const fileName = fileItem.name || "image.jpg";
      const fileExt = fileName.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = `image/${fileExt === "jpg" ? "jpeg" : fileExt}`;

      const newFile = new File([blob], fileName, { type: mimeType });
      setReferenceImageFile(newFile);

      // 혹시 안내 문구
      console.log("참조 이미지로 추가되었습니다:", newFile.name);
    } catch (error) {
      console.error("참조 이미지 추가 오류:", error);
      setReferenceImageFile(null);
      setReferenceImageUrl("");
    }
  };

  return (
    <div className="flex w-screen h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
      {/* 왼쪽: VideoSidebar (영상 생성 옵션) */}
      <div className="h-full">
        <VideoSidebar
          onSubmit={handleSidebarSubmit}
          onTabChange={handleTabChange}
          referenceImageFile={referenceImageFile}
          referenceImageUrl={referenceImageUrl}
        />
      </div>

      {/* 중앙: 영상 미리보기 */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-4xl h-full flex flex-col">
          <div className="flex-1 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden">
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
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className="max-w-full max-h-[80%] rounded-lg shadow-lg"
                />

                {/* 저장 상태 표시 */}
                <div className="mt-4">
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
        onAddReferenceImage={handleAddReferenceImage} // +아이콘 클릭 콜백
      />
    </div>
  );
}
