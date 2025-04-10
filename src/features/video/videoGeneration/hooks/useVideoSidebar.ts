"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

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
  advancedCameraControl?: boolean;
  seed?: number;
  resolution?: string;
  numFrames?: number;
  framesPerSecond?: number;
  numInferenceSteps?: number;
  enableSafetyChecker?: boolean;
  enablePromptExpansion?: boolean;
};

export interface UseVideoSidebarProps {
  onSubmit: (data: SidebarFormData) => void;
  onTabChange: (tab: "image" | "text" | "video") => void;
  referenceImageFile?: File | null;
  referenceImageUrl?: string;
  referencePrompt?: string;
  referenceModel?: string;
}

export function useVideoSidebar({
  onSubmit,
  onTabChange,
  referenceImageFile,
  referenceImageUrl,
  referencePrompt,
  referenceModel,
}: UseVideoSidebarProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"image" | "text" | "video">("image");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState("5s");
  const [endpoint, setEndpoint] = useState(
    referenceModel || (activeTab === "image" ? "kling" : "veo2")
  );
  const [quality, setQuality] = useState<"standard" | "high">("standard");
  const [style, setStyle] = useState<"realistic" | "creative">("realistic");
  const [imageChanged, setImageChanged] = useState(false);
  const [cameraControl, setCameraControl] = useState<string>("down_back");
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [resolution, setResolution] = useState<string>("720p");
  const [numFrames, setNumFrames] = useState<number>(129);
  const [framesPerSecond, setFramesPerSecond] = useState<number>(16);
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(30);
  const [enableSafetyChecker, setEnableSafetyChecker] = useState<boolean>(true);
  const [enablePromptExpansion, setEnablePromptExpansion] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상위에서 전달받은 참조 프롬프트와 모델 반영
  useEffect(() => {
    if (referencePrompt) {
      setPrompt(referencePrompt);
    }
    if (referenceModel) {
      setEndpoint(referenceModel);
      // referenceModel이 "veo2"이면 video 탭으로 전환, 그렇지 않으면 image 탭으로 전환
      if (referenceModel === "veo2") {
        setActiveTab("video");
        onTabChange("video");
      } else {
        setActiveTab("image");
        onTabChange("image");
      }
    }
  }, [referencePrompt, referenceModel, onTabChange]);

  // 상위에서 referenceImageFile 또는 referenceImageUrl이 변경되면 상태에 반영
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
      const timer = setTimeout(() => setImageChanged(false), 3000);
      return () => clearTimeout(timer);
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

  // 모델 설정 업데이트 함수 (endpoint 업데이트 로직 추가)
  const updateSettings = (settings: any) => {
    if (settings.endpoint !== undefined) setEndpoint(settings.endpoint);
    if (settings.aspectRatio !== undefined) setAspectRatio(settings.aspectRatio);
    if (settings.duration !== undefined) setDuration(settings.duration);
    if (settings.cameraControl !== undefined)
      setCameraControl(settings.cameraControl);
    if (settings.seed !== undefined) setSeed(settings.seed);
    if (settings.resolution !== undefined) setResolution(settings.resolution);
    if (settings.numFrames !== undefined) setNumFrames(settings.numFrames);
    if (settings.framesPerSecond !== undefined)
      setFramesPerSecond(settings.framesPerSecond);
    if (settings.numInferenceSteps !== undefined)
      setNumInferenceSteps(settings.numInferenceSteps);
    if (settings.enableSafetyChecker !== undefined)
      setEnableSafetyChecker(settings.enableSafetyChecker);
    if (settings.enablePromptExpansion !== undefined)
      setEnablePromptExpansion(settings.enablePromptExpansion);
  };

  // 폼 제출 핸들러 (업스케일링 옵션은 제거됨)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 비디오 생성 요청 전 토스트 알림
    toast({
      title: "비디오 생성 시작",
      description: "비디오 생성이 시작되었습니다. 완료되면 알림을 보내드립니다.",
      duration: 5000,
    });

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
      seed: endpoint === "hunyuan" || endpoint === "wan" ? seed : undefined,
      resolution:
        endpoint === "hunyuan" || endpoint === "wan" ? resolution : undefined,
      numFrames:
        endpoint === "hunyuan"
          ? numFrames
          : endpoint === "wan"
            ? numFrames
            : undefined,
      framesPerSecond: endpoint === "wan" ? framesPerSecond : undefined,
      numInferenceSteps: endpoint === "wan" ? numInferenceSteps : undefined,
      enableSafetyChecker: endpoint === "wan" ? enableSafetyChecker : undefined,
      enablePromptExpansion:
        endpoint === "wan" ? enablePromptExpansion : undefined,
    });
  };

  // 탭 전환 핸들러
  const handleTabSelection = (tab: "image" | "text" | "video") => {
    setActiveTab(tab);
    onTabChange(tab);
    if (
      !referenceModel ||
      tab !== (referenceModel === "veo2" ? "video" : "image")
    ) {
      if (tab === "image") setEndpoint("kling");
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

  return {
    prompt,
    setPrompt,
    imageFile,
    previewUrl,
    fileUrl,
    activeTab,
    aspectRatio,
    duration,
    endpoint,
    quality,
    style,
    imageChanged,
    cameraControl,
    seed,
    resolution,
    numFrames,
    framesPerSecond,
    numInferenceSteps,
    enableSafetyChecker,
    enablePromptExpansion,
    updateSettings,
    handleSubmit,
    handleImageChange,
    handleTabSelection,
    selectImage,
    removeImage,
    fileInputRef,
    setQuality,
    setStyle,
  };
}
