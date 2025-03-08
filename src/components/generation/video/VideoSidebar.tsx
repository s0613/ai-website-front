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
import { Image as FileImage, Upload, CheckCircle, Info } from "lucide-react";
import { toast } from "react-hot-toast";

export type SidebarFormData = {
  prompt: string;
  imageFile: File | null;
  aspectRatio: string;
  duration: string;
  endpoint: string;
  quality: "standard" | "high";
  style: "realistic" | "creative";
  fileUrl?: string; // 드래그 앤 드롭 시 받은 URL (또는 +버튼으로 세팅된 URL)
  // kling API를 위한 추가 필드
  cameraControl?: string;
  advancedCameraControl?: any;
};

type VideoSidebarProps = {
  onSubmit: (data: SidebarFormData) => void;
  onTabChange: (tab: "image" | "text") => void;

  // + 버튼을 통해 넘어온 파일/URL
  referenceImageFile?: File | null;
  referenceImageUrl?: string;
};

// 엔드포인트별 설명 정보 추가
const endpointDescriptions: Record<string, string> = {
  luna: "고품질 이미지 투 비디오 변환. 자연스러운 움직임과 세부 표현이 뛰어남",
  veo2: "텍스트 프롬프트로부터 안정적인 영상 생성. 넓은 주제 범위를 커버",
  kling:
    "빠른 이미지 투 비디오 변환. 다이나믹한 움직임과 생생한 색감 표현에 최적화",
  wan: "정교한 이미지 투 비디오 변환. 세밀한 디테일과 다양한 시각적 효과를 지원",
};

// 카메라 컨트롤 옵션 설명 추가
const cameraControlDescriptions: Record<string, string> = {
  down_back: "아래에서 뒤로 움직이는 시점",
  forward_up: "앞에서 위로 움직이는 시점",
  right_turn_forward: "오른쪽에서 앞으로 회전하는 시점",
  left_turn_forward: "왼쪽에서 앞으로 회전하는 시점",
};

export default function VideoSidebar({
  onSubmit,
  onTabChange,
  referenceImageFile,
  referenceImageUrl,
}: VideoSidebarProps) {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState("5s");
  const [endpoint, setEndpoint] = useState(
    activeTab === "image" ? "luna" : "veo2"
  );
  const [quality, setQuality] = useState<"standard" | "high">("standard");
  const [style, setStyle] = useState<"realistic" | "creative">("realistic");
  const [imageChanged, setImageChanged] = useState(false);
  const [cameraControl, setCameraControl] = useState<string>("down_back");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // (1) 상위에서 referenceImageFile/Url이 바뀌면 state에 반영
  useEffect(() => {
    if (referenceImageFile || referenceImageUrl) {
      if (referenceImageFile) {
        setImageFile(referenceImageFile);
        const objectURL = URL.createObjectURL(referenceImageFile);
        setPreviewUrl(objectURL);
        setFileUrl("");
      } else if (referenceImageUrl) {
        // 파일 객체 없이 URL만 넘어오는 경우
        setImageFile(null);
        setPreviewUrl(referenceImageUrl);
        setFileUrl(referenceImageUrl);
      }

      // 이미지 변경 애니메이션 효과 추가
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
      cameraControl, // 카메라 컨트롤 추가
    });
  };

  const handleTabSelection = (tab: "image" | "text") => {
    setActiveTab(tab);
    onTabChange(tab);
    if (tab === "image") setEndpoint("luna");
    else setEndpoint("veo2");
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

            {/* 비율 부분 수정 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                비율
              </label>
              <div className="grid grid-cols-3 gap-2">
                {endpoint === "kling"
                  ? ["16:9", "9:16", "1:1"].map((ratio) => (
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
                    ))
                  : ["16:9", "9:16"].map((ratio) => (
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

            {/* duration 부분 수정 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                길이
              </label>
              <div className="grid grid-cols-4 gap-1">
                {/* kling 선택 시 5s, 10s만 표시, 그 외에는 기존 옵션 표시 */}
                {endpoint === "kling"
                  ? ["5s", "10s"].map((dur) => (
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
                    ))
                  : ["5s", "6s", "7s", "8s"].map((dur) => (
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
                  </>
                ) : (
                  <>
                    <option value="veo2">VEO2</option>
                    <option value="luna">LUNA</option>
                  </>
                )}
              </select>

              {/* 모델 설명 섹션이 확실히 표시되도록 수정 */}
              <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  {endpointDescriptions[endpoint]}
                </p>
              </div>
            </div>

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

            {/* kling 선택 시 카메라 컨트롤 옵션 표시 */}
            {endpoint === "kling" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  카메라 움직임
                </label>
                <select
                  value={cameraControl}
                  onChange={(e) => setCameraControl(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="down_back">아래에서 뒤로</option>
                  <option value="forward_up">앞에서 위로</option>
                  <option value="right_turn_forward">오른쪽에서 회전</option>
                  <option value="left_turn_forward">왼쪽에서 회전</option>
                </select>
                <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    {cameraControlDescriptions[cameraControl]}
                  </p>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full mt-4">
              영상 생성
            </Button>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
