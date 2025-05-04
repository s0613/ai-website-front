// hooks/useVideoGeneration.ts

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  saveVideo,
  readFileAsBase64,
  getVideoEndpointUrl
} from "../../services/GenerateService";
import { BillingService } from "@/features/payment/services/BillingService";
import { useCredit } from "@/features/payment/context/CreditContext";
import { useRouter } from "next/navigation";
import { ReadonlyURLSearchParams } from "next/navigation";
import { GenerationNotificationService } from '@/features/admin/services/GenerationNotificationService';

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

// VideoGenerationRequest 타입을 모델별로 다르게 처리하기 어려우므로,
// payload 타입을 any로 하고, 전송 시 모델에 맞게 키를 조정합니다.
// interface VideoGenerationRequest { ... }

// 사용되지 않는 타입 제거 또는 주석 처리 (VideoGenerationResponse)
// interface VideoGenerationResponse {
//   videoUrl: string;
//   requestId?: string;
// }

// Fal.ai 응답 구조에 맞는 새로운 타입 정의
interface FalVideoFile {
  url: string;
  content_type: string;
  file_name: string;
  file_size: number;
}

interface FalVideoResponseData {
  video: FalVideoFile;
  seed?: number;
  // 다른 필드가 있다면 추가 가능
}

// WAN, Kling 응답 타입 정의 (단순화)
interface CustomVideoResponse {
  videoUrl: string;
  requestId?: string;
}

interface UseVideoGenerationProps {
  searchParams?: ReadonlyURLSearchParams | null;
}

// --- 모델별 요청 타입 정의 --- 
// 공통 파라미터 (필요시 확장)
interface BaseVideoRequest {
  prompt: string;
}

// Hunyuan 요청 타입
interface HunyuanRequest extends BaseVideoRequest {
  image_url?: string;
  seed?: number;
  aspect_ratio?: string;
  resolution?: string;
  num_frames?: number;
  i2v_stability?: boolean;
}

// WAN (Pro) 요청 타입
interface WanRequest extends BaseVideoRequest {
  imageUrl?: string; // camelCase 주의
  seed?: number;
  enable_safety_checker?: boolean;
  // 라우트에서 사용되지 않는 파라미터는 제외
}

// Veo2 요청 타입
interface Veo2Request extends BaseVideoRequest {
  image_url?: string;
  aspect_ratio?: string;
  duration?: string;
}

// Kling 요청 타입
interface KlingRequest extends BaseVideoRequest {
  imageUrl?: string; // camelCase 주의
  duration?: number; // 숫자 타입 주의
  aspect_ratio?: string;
  camera_control?: string;
  // negative_prompt, cfg_scale 등 추가 가능
}

// 모든 요청 타입을 포함하는 유니온 타입
type VideoGenerationRequestUnion =
  | HunyuanRequest
  | WanRequest
  | Veo2Request
  | KlingRequest;

export default function useVideoGeneration({ searchParams }: UseVideoGenerationProps = {}) {
  const { updateCredits } = useCredit();
  const router = useRouter();

  // 영상 생성 및 저장 관련 상태
  const [videoUrl, setVideoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving] = useState(false);
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

    let notificationId: number | null = null;
    try {
      // 1. 알림 REQUESTED 등록
      const notification = await GenerationNotificationService.createNotification({
        title: data.prompt || new Date().toLocaleString(),
        thumbnailUrl: data.fileUrl || referenceImageUrl || '',
      });
      notificationId = notification.id;

      // 현재 크레딧 확인
      const creditResponse = await BillingService.getCurrentCredit();
      if (creditResponse.currentCredit < 10) {
        toast.error("크레딧이 부족합니다. 크레딧을 충전해주세요.");
        router.push("/payment");
        // 실패 처리
        if (notificationId !== null) {
          await GenerationNotificationService.updateNotification(notificationId, { status: 'FAILED' });
        }
        setIsLoading(false);
        return;
      }

      // 크레딧 소비 요청
      await BillingService.consumeCredit({
        amount: 10,
        reason: "비디오 생성"
      });
      updateCredits(-10);

      const endpointUrl = getVideoEndpointUrl(data.endpoint);

      // 이미지 처리 (기존과 동일)
      let imageBase64 = "";
      if (data.imageFile) {
        try {
          imageBase64 = await readFileAsBase64(data.imageFile);
        } catch (error) {
          console.error("Error reading file as Base64:", error);
          toast.error("이미지 파일을 처리하는 중 오류가 발생했습니다.");
          // Base64 변환 실패 시 알림 상태 업데이트 및 중단
          if (notificationId !== null) {
            await GenerationNotificationService.updateNotification(notificationId, { status: 'FAILED' });
          }
          setIsLoading(false);
          return;
        }
      }

      // --- 페이로드 생성 (타입 안전하게) --- 
      let payload: VideoGenerationRequestUnion;

      switch (data.endpoint) {
        case "hunyuan":
          payload = {
            prompt: data.prompt,
            image_url: imageBase64 ? imageBase64 : undefined,
            seed: data.seed,
            aspect_ratio: data.aspectRatio,
            resolution: data.resolution,
            num_frames: data.numFrames,
            // i2v_stability: data.i2vStability, // 타입 및 값 확인 필요
          } as HunyuanRequest;
          break;
        case "wan":
          payload = {
            prompt: data.prompt,
            imageUrl: imageBase64 ? imageBase64 : undefined,
            seed: data.seed || Math.floor(Math.random() * 1000000),
            // enable_safety_checker: data.enableSafetyChecker, // 라우트 및 Fal.ai 요청 키 확인 필요
          } as WanRequest;
          break;
        case "veo2":
          payload = {
            prompt: data.prompt,
            image_url: imageBase64 ? imageBase64 : undefined,
            aspect_ratio: data.aspectRatio,
            duration: data.duration,
          } as Veo2Request;
          break;
        case "kling":
          payload = {
            prompt: data.prompt,
            imageUrl: imageBase64 ? imageBase64 : undefined,
            duration: data.duration ? parseInt(data.duration.replace('s', '')) : 5,
            aspect_ratio: data.aspectRatio,
            camera_control: data.cameraControl,
          } as KlingRequest;
          break;
        default:
          // 기본 또는 오류 처리
          console.error("지원하지 않는 엔드포인트:", data.endpoint);
          toast.error("지원하지 않는 모델입니다.");
          setIsLoading(false);
          return;
      }

      // *** 필수 파라미터 검증 (API 호출 전) ***
      let hasRequiredImageUrl = false;
      if (payload && 'image_url' in payload && payload.image_url) {
        hasRequiredImageUrl = true;
      }
      if (payload && 'imageUrl' in payload && payload.imageUrl) {
        hasRequiredImageUrl = true;
      }

      if (!hasRequiredImageUrl) {
        console.error(`${data.endpoint} API 호출 불가: 이미지 URL이 없습니다.`);
        toast.error("이미지 정보가 없어 비디오 생성을 시작할 수 없습니다.");
        if (notificationId !== null) {
          await GenerationNotificationService.updateNotification(notificationId, { status: 'FAILED' });
        }
        setIsLoading(false);
        return;
      }

      // 2. 서버에 비디오 생성 API 요청
      let result: FalVideoResponseData | CustomVideoResponse | null = null; // 응답 타입 유니온
      try {
        // 상태: PROCESSING
        if (notificationId !== null) {
          await GenerationNotificationService.updateNotification(notificationId, { status: 'PROCESSING' });
        }
        const response = await fetch(endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          // 서버 오류 응답 처리 개선
          let errorBody = { error: `API 요청 실패: ${response.status}` };
          try {
            errorBody = await response.json();
          } catch (e) {
            console.error("Failed to parse error response body:", e);
          }
          console.error(`API 요청 실패: ${response.status}`, errorBody);
          throw new Error(errorBody.error || `API 요청 실패: ${response.status}`);
        }
        result = await response.json();
      } catch (err) {
        // 생성 실패 (네트워크 오류, 타임아웃, 서버 오류 등)
        if (notificationId !== null) {
          await GenerationNotificationService.updateNotification(notificationId, { status: 'FAILED' });
        }
        throw err;
      }

      // --- 3. 응답 처리 (모델별 분기) --- 
      try {
        let generatedVideoUrl: string | undefined = undefined;

        if (result) {
          // WAN, Kling 모델 응답 처리 ({ videoUrl: ... })
          if (data.endpoint === "wan" || data.endpoint === "kling") {
            // 타입 단언 사용 (주의해서 사용)
            const customResponse = result as CustomVideoResponse;
            if (customResponse && typeof customResponse.videoUrl === 'string') {
              generatedVideoUrl = customResponse.videoUrl;
            }
          }
          // Hunyuan, Veo2 모델 응답 처리 (Fal.ai 응답 그대로)
          else {
            // 타입 단언 사용 (주의해서 사용)
            const falResponse = result as FalVideoResponseData;
            if (falResponse && typeof falResponse === 'object' && falResponse.video && typeof falResponse.video.url === 'string') {
              generatedVideoUrl = falResponse.video.url;
            }
          }
        }

        // URL 추출 성공 시 저장 로직 실행
        if (generatedVideoUrl) {
          setVideoUrl(generatedVideoUrl);
          await saveVideo({
            prompt: data.prompt,
            endpoint: data.endpoint,
            imageFile: data.imageFile,
            videoName: `AI 생성 영상 - ${new Date().toLocaleTimeString()}`,
            videoUrl: generatedVideoUrl,
          });
        } else {
          console.error("API 응답에서 비디오 URL을 찾을 수 없습니다:", result);
          throw new Error('비디오 URL 없음');
        }
      } catch (err) {
        // 저장 실패
        if (notificationId !== null) {
          await GenerationNotificationService.updateNotification(notificationId, { status: 'FAILED' });
        }
        throw err;
      }

      // 4. 저장 성공 → COMPLETED
      if (notificationId !== null) {
        await GenerationNotificationService.updateNotification(notificationId, { status: 'COMPLETED' });
      }
      setSaveSuccess(true);
      toast.success("영상이 성공적으로 생성되어 내 보관함에 저장되었습니다.", { duration: 5000 });
    } catch (error: unknown) {
      console.error("비디오 생성 전체 플로우 오류:", error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류 발생";
      setErrorMessage(errorMessage);
      toast.error(`영상 처리 중 오류: ${errorMessage}`);
      if (notificationId !== null) {
        try {
          await GenerationNotificationService.updateNotification(notificationId, { status: 'FAILED' });
        } catch (notifError) {
          console.error("Failed to update notification on final error:", notifError);
        }
      }
    } finally {
      setIsLoading(false);
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
