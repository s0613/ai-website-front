"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle } from "lucide-react";
import ModelSetting from "./ModelSetting";

export type SidebarFormData = {
  prompt: string;
  imageFile: File | null;
  aspectRatio: string;
  duration: string;
  endpoint: string;
  quality: "standard" | "high";
  style: "realistic" | "creative";
  fileUrl?: string;
  cameraControl?: string;
  advancedCameraControl?;
  seed?: number;
  resolution?: string;
  numFrames?: number;
};

type VideoSidebarProps = {
  onSubmit: (data: SidebarFormData) => void;
  onTabChange: (tab: "image" | "text") => void;
  referenceImageFile?: File | null;
  referenceImageUrl?: string;
  referencePrompt?: string; // 추가: 참조 프롬프트
  referenceModel?: string; // 추가: 참조 모델
};

export default function VideoSidebar({
  onSubmit,
  onTabChange,
  referenceImageFile,
  referenceImageUrl,
  referencePrompt,
  referenceModel,
}: VideoSidebarProps) {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState("5s");
  const [endpoint, setEndpoint] = useState(
    referenceModel || (activeTab === "image" ? "luna" : "veo2")
  );
  const [quality, setQuality] = useState<"standard" | "high">("standard");
  const [style, setStyle] = useState<"realistic" | "creative">("realistic");
  const [imageChanged, setImageChanged] = useState(false);
  const [cameraControl, setCameraControl] = useState<string>("down_back");
  // Hunyuan 모델을 위한 추가 상태
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [resolution, setResolution] = useState<string>("720p");
  const [numFrames, setNumFrames] = useState<number>(129);
  // Wan 모델을 위한 추가 상태
  const [framesPerSecond, setFramesPerSecond] = useState<number>(16);
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(30);
  const [enableSafetyChecker, setEnableSafetyChecker] = useState<boolean>(true);
  const [enablePromptExpansion, setEnablePromptExpansion] =
    useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상위에서 전달받은 참조 프롬프트와 모델 처리
  useEffect(() => {
    if (referencePrompt) {
      setPrompt(referencePrompt);
    }

    if (referenceModel) {
      // 모델 엔드포인트 설정
      setEndpoint(referenceModel);

      // 모델에 맞는 탭 설정
      if (referenceModel === "veo2") {
        setActiveTab("text");
        onTabChange("text");
      } else {
        setActiveTab("image");
        onTabChange("image");
      }

      console.log(`참조 모델 설정: ${referenceModel}`); // 디버깅용
    }
  }, [referencePrompt, referenceModel, onTabChange]);

  // 상위에서 referenceImageFile/Url이 바뀌면 state에 반영
  useEffect(() => {
    if (referenceImageFile || referenceImageUrl) {
      if (referenceImageFile) {
        setImageFile(referenceImageFile);
        const objectURL = URL.createObjectURL(referenceImageFile);
        setPreviewUrl(objectURL);
        setFileUrl("");
      } else if (referenceImageUrl) {
        setImageFile(null);
        setPreviewUrl(referenceImageUrl);
        setFileUrl(referenceImageUrl);
      }

      setImageChanged(true);
      setTimeout(() => setImageChanged(false), 3000);
    }
  }, [referenceImageFile, referenceImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setFileUrl("");
  };

  // updateSettings 함수 수정

  // 모델 설정 업데이트 함수
  const updateSettings = (settings: any) => {
    if (settings.aspectRatio !== undefined)
      setAspectRatio(settings.aspectRatio);
    if (settings.duration !== undefined) setDuration(settings.duration);
    if (settings.cameraControl !== undefined)
      setCameraControl(settings.cameraControl);

    // Hunyuan 모델 설정
    if (settings.seed !== undefined) setSeed(settings.seed);
    if (settings.resolution !== undefined) setResolution(settings.resolution);
    if (settings.numFrames !== undefined) setNumFrames(settings.numFrames);

    // Wan 모델 설정
    if (settings.framesPerSecond !== undefined)
      setFramesPerSecond(settings.framesPerSecond);
    if (settings.numInferenceSteps !== undefined)
      setNumInferenceSteps(settings.numInferenceSteps);
    if (settings.enableSafetyChecker !== undefined)
      setEnableSafetyChecker(settings.enableSafetyChecker);
    if (settings.enablePromptExpansion !== undefined)
      setEnablePromptExpansion(settings.enablePromptExpansion);
  };

  // handleSubmit 함수 수정

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
      fileUrl,
      cameraControl,
      // hunyuan 모델 파라미터
      seed: endpoint === "hunyuan" || endpoint === "wan" ? seed : undefined,
      resolution:
        endpoint === "hunyuan" || endpoint === "wan" ? resolution : undefined,
      numFrames:
        endpoint === "hunyuan"
          ? numFrames
          : endpoint === "wan"
          ? numFrames
          : undefined,
      // wan 모델 전용 파라미터
      framesPerSecond: endpoint === "wan" ? framesPerSecond : undefined,
      numInferenceSteps: endpoint === "wan" ? numInferenceSteps : undefined,
      enableSafetyChecker: endpoint === "wan" ? enableSafetyChecker : undefined,
      enablePromptExpansion:
        endpoint === "wan" ? enablePromptExpansion : undefined,
    });
  };

  const handleTabSelection = (tab: "image" | "text") => {
    setActiveTab(tab);
    onTabChange(tab);

    // 참조 모델이 없는 경우에만 기본값으로 변경
    // 또는 사용자가 명시적으로 탭을 변경한 후에는 referenceModel 영향을 제거
    if (
      !referenceModel ||
      tab !== (referenceModel === "veo2" ? "text" : "image")
    ) {
      if (tab === "image") setEndpoint("luna");
      else setEndpoint("veo2");
    }
  };

  const selectImage = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl("");
    setFileUrl("");
  };

  return (
    <div className="w-[260px] h-full bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {activeTab === "image" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center justify-between">
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
                        className={`relative w-full h-28 border rounded-md overflow-hidden cursor-pointer transition-all duration-300 ${
                          imageChanged ? "ring-2 ring-green-500 shadow-lg" : ""
                        }`}
                      >
                        <Image
                          src={previewUrl}
                          alt="미리보기"
                          fill
                          className="object-cover"
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
                    className="w-full h-28 border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors border-gray-300"
                    onClick={selectImage}
                  >
                    <Upload className="h-6 w-6 text-gray-400" />
                    <p className="mt-1 text-xs text-gray-500">
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
              <label className="block text-xs font-medium text-gray-700 mb-1">
                API 엔드포인트
              </label>
              <select
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {activeTab === "image" ? (
                  <>
                    <option value="luna">LUNA</option>
                    <option value="kling">KLING</option>
                    <option value="wan">WAN</option>
                    <option value="hunyuan">HUNYUAN</option>
                  </>
                ) : (
                  <>
                    <option value="veo2">VEO2</option>
                    <option value="luna">LUNA</option>
                  </>
                )}
              </select>
            </div>

            {/* 모델 설정 컴포넌트로 대체 */}
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

            <Button type="submit" className="w-full mt-4">
              영상 생성
            </Button>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
