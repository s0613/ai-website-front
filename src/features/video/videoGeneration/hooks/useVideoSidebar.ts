"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadImageAPI } from "../../services/fileService";
import { GenerationNotificationService } from '@/features/admin/services/GenerationNotificationService';
import { AspectRatioType, DurationType } from "../types/modelSettingTypes";
import { FileResponse } from "../../types/fileTypes";

export type SidebarFormData = {
  prompt: string;
  imageFile: File | null;
  aspectRatio: AspectRatioType;
  duration: DurationType;
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

// updateSettings 함수의 파라미터 타입을 정의
interface SettingsUpdate {
  endpoint?: string;
  aspectRatio?: AspectRatioType;
  duration?: DurationType;
  cameraControl?: string;
  seed?: number;
  resolution?: string;
  numFrames?: number;
  framesPerSecond?: number;
  numInferenceSteps?: number;
  enableSafetyChecker?: boolean;
  enablePromptExpansion?: boolean;
}

export interface UseVideoSidebarProps {
  onSubmit: (data: SidebarFormData) => void;
  onTabChange: (tab: "image" | "text" | "video") => void;
  referenceImageFile?: File | null;
  referenceImageUrl?: string;
  referencePrompt?: string;
  referenceModel?: string;
  onNotifyProcessing?: (notification: unknown) => void; // any -> unknown
}

export function useVideoSidebar({
  onSubmit,
  onTabChange,
  referenceImageFile,
  referenceImageUrl,
  referencePrompt,
  referenceModel,
  onNotifyProcessing,
}: UseVideoSidebarProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"image" | "text" | "video">("image");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("16:9");
  const [duration, setDuration] = useState<DurationType>("5s");
  const [endpoint, setEndpoint] = useState(
    referenceModel || (activeTab === "image" ? "kling" : activeTab === "video" ? "hunyuan" : "veo2")
  );
  const quality: "standard" | "high" = "standard";
  const style: "realistic" | "creative" = "realistic";
  const [imageChanged, setImageChanged] = useState(false);
  const [cameraControl, setCameraControl] = useState<string>("down_back");
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [resolution, setResolution] = useState<string>("720p");
  const [numFrames, setNumFrames] = useState<number>(129);
  const [framesPerSecond, setFramesPerSecond] = useState<number>(16);
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(30);
  const [enableSafetyChecker, setEnableSafetyChecker] = useState<boolean>(true);
  const [enablePromptExpansion, setEnablePromptExpansion] = useState<boolean>(true);
  const [isPromptLoading, setIsPromptLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상위에서 전달받은 참조 프롬프트와 모델 반영
  useEffect(() => {
    if (referencePrompt) {
      setPrompt(referencePrompt);
    }
    if (referenceModel) {
      setEndpoint(referenceModel);
      // referenceModel이 "hunyuan"이면 video 탭으로 전환, 그렇지 않으면 image 탭으로 전환
      if (referenceModel === "hunyuan") {
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
    const timerId: NodeJS.Timeout = setTimeout(() => setImageChanged(false), 3000);
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
      return () => clearTimeout(timerId);
    }
  }, [referenceImageFile, referenceImageUrl]);

  // endpoint 또는 activeTab이 변경될 때 aspectRatio 및 duration 기본값 조정
  useEffect(() => {
    let defaultAspectRatio: AspectRatioType = "16:9";
    let defaultDuration: DurationType = "5s";

    if (activeTab === "image") {
      switch (endpoint) {
        case "veo2":
          defaultAspectRatio = "9:16"; // Veo2 이미지 모드 기본 비율
          defaultDuration = "5s";    // Veo2 이미지 모드 기본 길이
          break;
        case "kling":
          defaultAspectRatio = "16:9"; // Kling 이미지 모드 기본 비율 (예시)
          defaultDuration = "5s";    // Kling 이미지 모드 기본 길이 (예시)
          break;
        // 다른 이미지 모델에 대한 기본값 추가
      }
    } else if (activeTab === "text") {
      switch (endpoint) {
        case "veo2":
          defaultAspectRatio = "16:9"; // Veo2 텍스트 모드 기본 비율 (예시)
          defaultDuration = "5s";    // Veo2 텍스트 모드 기본 길이 (예시)
          break;
        // 다른 텍스트 모델에 대한 기본값 추가
      }
    } else if (activeTab === "video") {
      // 비디오 탭 모델에 대한 기본값 (예: hunyuan)
      switch (endpoint) {
        case "hunyuan":
          defaultAspectRatio = "16:9";
          defaultDuration = "5s"; // DurationType에 맞게 수정
          break;
      }
    }
    setAspectRatio(defaultAspectRatio);
    setDuration(defaultDuration);
  }, [endpoint, activeTab]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setFileUrl("");
    setImageChanged(true);
    setTimeout(() => setImageChanged(false), 3000);
  };

  const updateSettings = (settings: SettingsUpdate) => {
    if (settings.endpoint !== undefined) setEndpoint(settings.endpoint);
    if (settings.aspectRatio !== undefined) setAspectRatio(settings.aspectRatio);
    if (settings.duration !== undefined) setDuration(settings.duration);
    if (settings.cameraControl !== undefined) setCameraControl(settings.cameraControl);
    if (settings.seed !== undefined) setSeed(settings.seed);
    if (settings.resolution !== undefined) setResolution(settings.resolution);
    if (settings.numFrames !== undefined) setNumFrames(settings.numFrames);
    if (settings.framesPerSecond !== undefined) setFramesPerSecond(settings.framesPerSecond);
    if (settings.numInferenceSteps !== undefined) setNumInferenceSteps(settings.numInferenceSteps);
    if (settings.enableSafetyChecker !== undefined) setEnableSafetyChecker(settings.enableSafetyChecker);
    if (settings.enablePromptExpansion !== undefined) setEnablePromptExpansion(settings.enablePromptExpansion);
  };

  // 더 이상 ref를 사용하지 않고 직접 상태 변수 사용

  // 폼 제출 핸들러 (업스케일링 옵션은 제거됨)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    toast({
      title: "비디오 생성 시작",
      description: "비디오 생성이 시작되었습니다. 완료되면 알림을 보내드립니다.",
      duration: 5000,
    });

    try {
      const notification = await GenerationNotificationService.createNotification({
        title: `영상 생성 요청 (${new Date().toLocaleTimeString()})`,
        // 썸네일, mediaCount 등 필요시 추가
      });
      if (onNotifyProcessing) onNotifyProcessing(notification);
    } catch (error: unknown) {
      console.error('Gemini API Error:', error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "프롬프트 수정 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 3000,
      });
    }

    onSubmit({
      prompt: prompt,
      imageFile: imageFile,
      aspectRatio,
      duration,
      endpoint,
      quality,
      style,
      fileUrl: fileUrl,
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
    // endpoint 기본값 설정 로직은 endpoint, activeTab 의존 useEffect로 이동
  };

  const selectImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const response: FileResponse = await uploadImageAPI(file);
          setFileUrl(response.url);
          setImageFile(null);
          setPreviewUrl(response.url);
          setImageChanged(true);
          setTimeout(() => setImageChanged(false), 3000);
          toast({
            title: "이미지 업로드 성공",
            description: "이미지가 성공적으로 업로드되었습니다.",
            duration: 3000,
          });
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "이미지 업로드 실패",
            description: "이미지 업로드 중 오류가 발생했습니다.",
            variant: "destructive",
            duration: 3000,
          });
        }
      }
    };
    input.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl("");
    setFileUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setImageChanged(false);
  };

  const updatePromptWithGemini = async () => {
    if (!previewUrl && !imageFile) {
      toast({
        title: "이미지 필요",
        description: "프롬프트 생성을 위해 이미지를 먼저 업로드해주세요.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsPromptLoading(true);
    try {
      let imageData = "";
      if (imageFile) {
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } else if (fileUrl) {
        // URL인 경우, 직접 URL을 사용하거나 필요시 fetch하여 base64 변환
        // 여기서는 간단히 fileUrl을 이미지 식별자로 간주 (Gemini API가 URL을 직접 처리할 수 있는 경우)
        // 만약 Gemini API가 base64만 받는다면, URL을 fetch해서 변환하는 로직 필요
        imageData = fileUrl;
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: imageData, existingPrompt: prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate prompt from Gemini API');
      }

      const data = await response.json();
      if (data.response) {
        setPrompt(data.response);
        toast({
          title: "프롬프트 생성 완료",
          description: "Gemini API로부터 프롬프트를 성공적으로 생성했습니다.",
          duration: 3000,
        });
      }
    } catch (error: unknown) {
      console.error('Gemini API Error:', error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "프롬프트 수정 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsPromptLoading(false);
    }
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
    isPromptLoading,
    fileInputRef,
    handleImageChange,
    updateSettings,
    handleSubmit,
    handleTabSelection,
    selectImage,
    removeImage,
    updatePromptWithGemini,
  };
}
