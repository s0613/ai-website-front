// hooks/useVideoGeneration.ts

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  saveVideo,
  readFileAsBase64,
  getVideoEndpointUrl
} from "../../services/GenerateService";
import { BillingService } from "@/features/payment/services/BillingService";
import { useCredit } from "@/features/payment/context/CreditContext";
import { useRouter } from "next/navigation";

// 타입 정의 추가
interface VideoGenerationData {
  prompt: string;
  aspectRatio: string;
  duration: string;
  quality?: string;
  style?: string;
  endpoint: string;
  imageFile?: File | null;
  fileUrl?: string;
  upscaling?: boolean;
  cameraControl?: string;
  seed?: number;
  resolution?: string;
  numFrames?: number;
}

interface FileItem {
  fileUrl: string;
  name: string;
}

interface VideoGenerationRequest {
  prompt: string;
  aspectRatio: string;
  duration: string;
  quality?: string;
  style?: string;
  imageUrl?: string;
  cameraControl?: string;
  seed?: number;
  resolution?: string;
  numFrames?: number;
}

interface VideoGenerationResponse {
  videoUrl: string;
  requestId?: string;
}

export default function useVideoGeneration() {
  const searchParams = useSearchParams();
  const { updateCredits } = useCredit();
  const router = useRouter();

  // 영상 생성 및 저장 관련 상태
  const [videoUrl, setVideoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledVideoUrl, setUpscaledVideoUrl] = useState("");

  // 사이드바 및 폴더 관련 상태
  const [activeTab, setActiveTab] = useState<"video" | "image" | "text">("video");
  const [selectedEndpoint, setSelectedEndpoint] = useState("luna");
  const [quality, setQuality] = useState<"standard" | "high">("standard");
  const [style, setStyle] = useState<"realistic" | "creative">("realistic");

  // 참조 이미지 및 프롬프트 관련 상태
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [referencePrompt, setReferencePrompt] = useState("");
  const [referenceModel, setReferenceModel] = useState("");

  // URL 쿼리 파라미터 처리
  useEffect(() => {
    if (searchParams) {
      const prompt = searchParams.get("prompt");
      const imageUrl = searchParams.get("imageUrl");
      const model = searchParams.get("model");

      if (prompt) setReferencePrompt(prompt);
      if (imageUrl) setReferenceImageUrl(imageUrl);
      if (model) {
        setReferenceModel(model);
        setSelectedEndpoint(model);
      }
    }
  }, [searchParams]);

  // VideoSidebar에서 전달받은 데이터로 영상 생성 요청
  const handleSidebarSubmit = async (data: VideoGenerationData) => {
    setErrorMessage("");
    setVideoUrl("");
    setUpscaledVideoUrl("");
    setIsLoading(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      // 현재 크레딧 확인
      const creditResponse = await BillingService.getCurrentCredit();
      if (creditResponse.currentCredit < 10) {
        // 크레딧이 부족할 경우 모달 표시
        toast.error("크레딧이 부족합니다. 크레딧을 충전해주세요.");
        router.push("/payment");
        return;
      }

      // 크레딧 소비 요청
      await BillingService.consumeCredit({
        amount: 10,
        reason: "비디오 생성"
      });
      // 크레딧 차감 후 상태 업데이트
      updateCredits(-10);

      // getVideoEndpointUrl 함수를 사용하여 엔드포인트 URL 가져오기
      const endpointUrl = getVideoEndpointUrl(data.endpoint, data.imageFile || data.fileUrl ? true : false);

      let imageBase64 = "";
      if (data.imageFile) {
        imageBase64 = await readFileAsBase64(data.imageFile);
      }

      const payload: VideoGenerationRequest = {
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        duration: data.duration,
        quality: data.quality,
        style: data.style,
      };

      // 이미지 URL 설정
      if (!data.imageFile && data.fileUrl) {
        payload.imageUrl = data.fileUrl;
      } else if (imageBase64) {
        payload.imageUrl = imageBase64;
      }

      // 각 엔드포인트별 추가 옵션
      if (data.cameraControl) payload.cameraControl = data.cameraControl;
      if (data.seed) payload.seed = data.seed;
      if (data.resolution) payload.resolution = data.resolution;
      if (data.numFrames) payload.numFrames = data.numFrames;

      // Next.js API 라우트로 직접 요청
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const result: VideoGenerationResponse = await response.json();

      if (result.videoUrl) {
        setVideoUrl(result.videoUrl);
        // 영상 생성 후 서버에 저장
        await saveVideoToServer(result.videoUrl, data);
        // 생성 완료 알림
        toast.success("영상이 성공적으로 생성되었습니다. 내 보관함에서 확인하실 수 있습니다.", {
          duration: 5000,
        });
      } else {
        setErrorMessage(
          "videoUrl이 아직 생성되지 않았습니다. Job ID: " +
          JSON.stringify(result)
        );
      }
    } catch (error: unknown) {
      console.error("영상 생성 오류:", error);
      setErrorMessage(error instanceof Error ? error.message : "오류 발생");
      toast.error("영상 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 생성된 영상을 서버에 저장하는 함수
  const saveVideoToServer = async (videoUrl: string, data: VideoGenerationData) => {
    try {
      setIsSaving(true);
      await saveVideo(videoUrl, {
        prompt: data.prompt,
        endpoint: data.endpoint,
        imageFile: data.imageFile,
        videoName: `AI 생성 영상 - ${new Date().toLocaleString()}`
      });
      toast.success("비디오가 내 보관함에 저장되었습니다");
      setSaveSuccess(true);
    } catch (error: unknown) {
      console.error("비디오 저장 오류:", error);
      const errorMessage = error instanceof Error ? error.message : "비디오 저장 중 오류가 발생했습니다.";
      toast.error(errorMessage);
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // 업스케일링 처리 함수
  const handleUpscaleVideo = async () => {
    if (!videoUrl) return;

    try {
      setIsUpscaling(true);

      const response = await fetch('/api/video/upscaler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error(`업스케일링 요청 실패: ${response.status}`);
      }

      const result = await response.json();

      if (result.data?.video_upscaled) {
        setUpscaledVideoUrl(result.data.video_upscaled);
        toast.success("비디오 업스케일링이 완료되었습니다");
      } else {
        throw new Error("업스케일링된 비디오 URL을 받지 못했습니다");
      }
    } catch (error) {
      console.error("업스케일링 오류:", error);
      toast.error(error instanceof Error ? error.message : "업스케일링 중 오류가 발생했습니다");
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleTabChange = (tab: "video" | "image" | "text") => {
    if (tab === "image" || tab === "text") {
      setActiveTab(tab);
    }
  };

  const handleAddReferenceImage = async (fileItem: FileItem) => {
    setReferenceImageUrl(fileItem.fileUrl);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImageFile(file);
      setReferenceImageUrl(URL.createObjectURL(file));
    }
  };

  const selectImage = () => {
    document.getElementById("imageInput")?.click();
  };

  const removeImage = () => {
    setReferenceImageFile(null);
    setReferenceImageUrl("");
  };

  return {
    videoUrl,
    errorMessage,
    isLoading,
    isSaving,
    saveSuccess,
    saveError,
    isUpscaling,
    upscaledVideoUrl,
    activeTab,
    selectedEndpoint,
    quality,
    style,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
    handleSidebarSubmit,
    handleUpscaleVideo,
    handleTabChange,
    handleAddReferenceImage,
    handleImageChange,
    selectImage,
    removeImage,
    setSelectedEndpoint,
    setQuality,
    setStyle,
    setReferencePrompt
  };
}
