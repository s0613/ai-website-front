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
  style: "realistic" | "creative" | "anime" | "3d_animation" | "clay" | "comic" | "cyberpunk";
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
  negative_prompt?: string;
};

// updateSettings 함수의 파라미터 타입을 정의
interface SettingsUpdate {
  endpoint?: string;
  aspectRatio?: AspectRatioType;
  duration?: DurationType | "5" | "8";
  cameraControl?: string;
  seed?: number;
  resolution?: string;
  numFrames?: number;
  framesPerSecond?: number;
  numInferenceSteps?: number;
  enableSafetyChecker?: boolean;
  enablePromptExpansion?: boolean;
  negative_prompt?: string;
  style?: "anime" | "3d_animation" | "clay" | "comic" | "cyberpunk";
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
  const [style, setStyle] = useState<"realistic" | "creative" | "anime" | "3d_animation" | "clay" | "comic" | "cyberpunk">("realistic");
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
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [pixverseStyle, setPixverseStyle] = useState<"anime" | "3d_animation" | "clay" | "comic" | "cyberpunk" | "">("anime");

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
        case "pixverse":
          defaultAspectRatio = "16:9"; // Pixverse 기본 비율
          defaultDuration = "5s";    // Pixverse 기본 길이
          // Pixverse 기본 스타일을 항상 "anime"로 설정
          setPixverseStyle("anime");
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
    console.log('[updateSettings] 호출됨:', settings);
    if (settings.endpoint !== undefined) {
      setEndpoint(settings.endpoint);
      // endpoint가 pixverse로 변경될 때 기본 스타일 설정
      if (settings.endpoint === "pixverse" && !pixverseStyle) {
        setPixverseStyle("anime");
      }
    }
    if (settings.aspectRatio !== undefined) setAspectRatio(settings.aspectRatio);
    if (settings.duration !== undefined) {
      // Pixverse duration 값을 DurationType으로 변환
      if (settings.duration === "5") {
        setDuration("5s");
      } else if (settings.duration === "8") {
        setDuration("8s");
      } else {
        setDuration(settings.duration as DurationType);
      }
    }
    if (settings.cameraControl !== undefined) setCameraControl(settings.cameraControl);
    if (settings.seed !== undefined) setSeed(settings.seed);
    if (settings.resolution !== undefined) setResolution(settings.resolution);
    if (settings.numFrames !== undefined) setNumFrames(settings.numFrames);
    if (settings.framesPerSecond !== undefined) setFramesPerSecond(settings.framesPerSecond);
    if (settings.numInferenceSteps !== undefined) setNumInferenceSteps(settings.numInferenceSteps);
    if (settings.enableSafetyChecker !== undefined) setEnableSafetyChecker(settings.enableSafetyChecker);
    if (settings.enablePromptExpansion !== undefined) setEnablePromptExpansion(settings.enablePromptExpansion);
    if (settings.negative_prompt !== undefined) setNegativePrompt(settings.negative_prompt);
    if (settings.style !== undefined) {
      console.log('[updateSettings] style 변경:', settings.style, '현재 pixverseStyle:', pixverseStyle);
      setPixverseStyle(settings.style);
      setStyle(settings.style); // 일반 style 상태도 업데이트
    }
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

    // try {
    //   const notification = await GenerationNotificationService.createNotification({
    //     title: `영상 생성 요청 (${new Date().toLocaleTimeString()})`,
    //     // 썸네일, mediaCount 등 필요시 추가
    //   });
    //   if (onNotifyProcessing) onNotifyProcessing(notification);
    // } catch (error: unknown) {
    //   console.error('Gemini API Error:', error);
    //   toast({
    //     title: "오류 발생",
    //     description: error instanceof Error ? error.message : "프롬프트 수정 중 오류가 발생했습니다.",
    //     variant: "destructive",
    //     duration: 3000,
    //   });
    // }

    onSubmit({
      prompt: prompt,
      imageFile: imageFile,
      aspectRatio,
      duration,
      endpoint,
      quality,
      style: endpoint === "pixverse" ? (pixverseStyle || "anime") : style,
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
      negative_prompt: endpoint === "pixverse" ? negativePrompt : undefined,
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
      // 이미지 URL 사용
      const imageUrl = fileUrl || previewUrl;

      const response = await fetch('/internal/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          existingPrompt: prompt
        }),
      });

      if (!response.ok) {
        let errorMessage = '프롬프트 생성 중 오류가 발생했습니다.';
        let errorDetails = '';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData.details || '';
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorDetails = `응답 상태: ${response.status} ${response.statusText}`;
        }

        throw new Error(`${errorMessage}\n${errorDetails}`);
      }

      const responseData = await response.json();

      if (responseData.response) {
        setPrompt(responseData.response);
        toast({
          title: "프롬프트 생성 완료",
          description: "Gemini API로부터 프롬프트를 성공적으로 생성했습니다.",
          duration: 3000,
        });
      } else {
        throw new Error('API 응답에 프롬프트 데이터가 없습니다.');
      }
    } catch (error: unknown) {
      console.error('Gemini API Error:', {
        error,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : undefined
      });

      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "프롬프트 수정 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 5000,
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
    negativePrompt,
    pixverseStyle,
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
