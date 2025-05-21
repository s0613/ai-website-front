// hooks/useVideoGeneration.ts

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getVideoEndpointUrl
} from "../../services/GenerateService";
import { BillingService } from "@/features/payment/services/BillingService";
import { useCredit } from "@/features/payment/context/CreditContext";
import { useRouter } from "next/navigation";
import { ReadonlyURLSearchParams } from "next/navigation";
import { GenerationNotificationService } from '@/features/admin/services/GenerationNotificationService';
import { useAuth } from "@/features/user/AuthContext";

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
  duration?: string;
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
  const { id: userId } = useAuth();

  // 영상 생성 및 저장 관련 상태
  const [videoUrl, setVideoUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledVideoUrl, setUpscaledVideoUrl] = useState("");

  // 사이드바 및 폴더 관련 상태
  const [activeTab, setActiveTab] = useState<"video" | "image" | "text">("image");
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

    let notificationId: number | null = null;
    try {
      if (!userId) {
        toast.error("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        router.push("/login");
        return;
      }

      // 1. 알림 REQUESTED 등록
      const notification = await GenerationNotificationService.createNotification({
        title: `영상 생성 (${new Date().toLocaleTimeString()})`,
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
        return;
      }

      // 크레딧 소비 요청
      await BillingService.consumeCredit({
        amount: 10,
        reason: "비디오 생성"
      });
      updateCredits(-10);

      const endpointUrl = getVideoEndpointUrl(data.endpoint, activeTab);

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
          return;
        }
      }

      // --- 페이로드 생성 (타입 안전하게) --- 
      let payload: VideoGenerationRequestUnion;

      switch (data.endpoint) {
        case "hunyuan":
          payload = {
            prompt: data.prompt,
            image_url: imageBase64 || data.fileUrl || undefined,
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
            imageUrl: imageBase64 || data.fileUrl || undefined,
            seed: data.seed || Math.floor(Math.random() * 1000000),
            // enable_safety_checker: data.enableSafetyChecker, // 라우트 및 Fal.ai 요청 키 확인 필요
          } as WanRequest;
          break;
        case "veo2":
          payload = {
            prompt: data.prompt,
            image_url: imageBase64 || data.fileUrl || undefined,
            aspect_ratio: data.aspectRatio,
            duration: data.duration,
          } as Veo2Request;
          break;
        case "kling":
          payload = {
            prompt: data.prompt,
            imageUrl: imageBase64 || data.fileUrl || undefined,
            duration: data.duration,
            aspect_ratio: data.aspectRatio,
            camera_control: data.cameraControl,
          } as KlingRequest;
          break;
        default:
          // 기본 또는 오류 처리
          console.error("지원하지 않는 엔드포인트:", data.endpoint);
          toast.error("지원하지 않는 모델입니다.");
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
        return;
      }

      // 2. 서버에 비디오 생성 API 요청
      try {
        // 상태: PROCESSING
        if (notificationId !== null) {
          await GenerationNotificationService.updateNotification(notificationId, { status: 'PROCESSING' });
          // 알림 벨 이벤트 트리거 추가
          window.dispatchEvent(new Event('open-notification-bell'));
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15 * 60 * 1000); // 15분

        // notificationId와 userId를 payload에 추가
        const requestPayload = {
          ...payload,
          notificationId: notificationId !== null ? notificationId.toString() : undefined,
          userId: userId.toString() // AuthContext에서 가져온 userId 사용
        };

        console.log(`[비디오 생성] 요청 전송 중: ${endpointUrl}, 알림 ID: ${notificationId || 'none'}`);

        let response;
        try {
          response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
            signal: controller.signal, // AbortController의 signal 연결
          });
        } finally {
          clearTimeout(timeoutId); // fetch가 완료되거나 실패하면 타이머 제거
        }

        // API 응답 상태 확인
        if (!response.ok) {
          let errorBody = { error: `API 요청 실패: ${response.status}` };
          try {
            errorBody = await response.json();
          } catch (e) {
            console.error("Failed to parse error response body:", e);
          }
          console.error(`API 요청 실패: ${response.status}`, errorBody);

          // 실패 시 즉시 알림 상태 업데이트
          if (notificationId !== null) {
            await GenerationNotificationService.updateNotification(notificationId, {
              status: 'FAILED',
              errorMessage: errorBody.error || `API 요청 실패: ${response.status}`
            });
          }
          throw new Error(errorBody.error || `API 요청 실패: ${response.status}`);
        }

        // API 응답 처리 - 여기서는 실제 저장 대신 상태만 설정
        const result = await response.json();

        // 응답에서 비디오 URL 추출 (UI 표시용)
        let generatedVideoUrl = "";

        if (result) {
          // WAN, Kling 모델 응답 처리 ({ videoUrl: ... })
          if (data.endpoint === "wan" || data.endpoint === "kling") {
            const customResponse = result as CustomVideoResponse;
            if (customResponse && typeof customResponse.videoUrl === 'string') {
              generatedVideoUrl = customResponse.videoUrl;
            }
          }
          // Hunyuan, Veo2 모델 응답 처리 (Fal.ai 응답 그대로)
          else {
            const falResponse = result as FalVideoResponseData;
            if (falResponse && typeof falResponse === 'object' && falResponse.video && typeof falResponse.video.url === 'string') {
              generatedVideoUrl = falResponse.video.url;
            }
          }
        }

        // 미리보기 URL 설정
        if (generatedVideoUrl) {
          setVideoUrl(generatedVideoUrl);
          toast.success("영상 생성 요청이 처리 중입니다. 알림을 통해 완료 여부를 확인해주세요.");
        }

        // 알림 모니터링 시작 - 비디오 자동 저장 알림
        const notificationCheckInterval = setInterval(async () => {
          try {
            if (notificationId === null) {
              clearInterval(notificationCheckInterval);
              return;
            }

            const notifStatus = await GenerationNotificationService.getNotification(notificationId);
            if (notifStatus.status === 'COMPLETED') {
              clearInterval(notificationCheckInterval);
              toast.success("영상이 생성되고 자동으로 저장되었습니다! 알림을 클릭하여 확인하세요.");
            } else if (notifStatus.status === 'FAILED') {
              clearInterval(notificationCheckInterval);
              toast.error(`영상 생성 실패: ${notifStatus.errorMessage || '알 수 없는 오류'}`);
            }
          } catch (e) {
            console.error("알림 상태 확인 실패:", e);
          }
        }, 5000); // 5초마다 확인

        // 1분 후 인터벌 강제 종료 (너무 오래 확인하지 않도록)
        setTimeout(() => {
          clearInterval(notificationCheckInterval);
        }, 60000);
      } catch (err) {
        // 생성 실패 (네트워크 오류, 타임아웃, 서버 오류 등)
        if (notificationId !== null) {
          await GenerationNotificationService.updateNotification(notificationId, { status: 'FAILED' });
        }
        throw err;
      }
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
    }
  };

  // 업스케일링 처리 함수
  const handleUpscaleVideo = async () => {
    if (!videoUrl) return;

    try {
      setIsUpscaling(true);

      const response = await fetch('/internal/video/upscaler', {
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

  // Base64 변환 함수
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to Base64'));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    videoUrl,
    errorMessage,
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
