// hooks/useVideoGeneration.ts

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  generateVideo,
  saveVideo,
  upscaleVideo,
  readFileAsBase64,
} from "../services/videoService";

export default function useVideoGeneration() {
  const searchParams = useSearchParams();

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
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");
  const [selectedEndpoint, setSelectedEndpoint] = useState("luna");
  const [quality, setQuality] = useState<"standard" | "high">("standard");
  const [style, setStyle] = useState<"realistic" | "creative">("realistic");

  // 참조 이미지 및 프롬프트 관련 상태
  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(
    null
  );
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
  const handleSidebarSubmit = async (data: any) => {
    setErrorMessage("");
    setVideoUrl("");
    setUpscaledVideoUrl(""); // 업스케일링 결과 초기화
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
        imageBase64 = await readFileAsBase64(data.imageFile);
      }

      const payload: any = {
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

      // 업스케일링 옵션 추가
      if (data.upscaling) {
        payload.upscaling = "true";
      }

      const result = await generateVideo(payload, endpointUrl);
      if (result.videoUrl) {
        setVideoUrl(result.videoUrl);
        // 영상 생성 후 서버에 저장
        await saveVideoToServer(result.videoUrl, data);
      } else {
        setErrorMessage(
          "videoUrl이 아직 생성되지 않았습니다. Job ID: " +
            JSON.stringify(result)
        );
      }
    } catch (error: any) {
      console.error("영상 생성 오류:", error);
      setErrorMessage(error.message ?? "오류 발생");
    } finally {
      setIsLoading(false);
    }
  };

  // 생성된 영상을 서버에 저장하는 함수
  const saveVideoToServer = async (videoUrl: string, data: any) => {
    try {
      setIsSaving(true);
      await saveVideo(videoUrl, data);
      toast.success("비디오가 내 보관함에 저장되었습니다");
      setSaveSuccess(true);
    } catch (error: any) {
      console.error("비디오 저장 오류:", error);
      toast.error(error.message || "비디오 저장 중 오류가 발생했습니다.");
      setSaveError(error.message || "비디오 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 업스케일링 처리 함수
  const handleUpscaleVideo = async () => {
    if (!videoUrl) return;

    try {
      setIsUpscaling(true);
      setUpscaledVideoUrl("");
      const result = await upscaleVideo(videoUrl);
      if (result.data && result.data.video_upscaled) {
        setUpscaledVideoUrl(result.data.video_upscaled);
        toast.success("비디오 업스케일링이 완료되었습니다!");
      } else {
        throw new Error("업스케일링된 비디오 URL을 찾을 수 없습니다");
      }
    } catch (error: any) {
      console.error("비디오 업스케일링 오류:", error);
      toast.error(error.message || "업스케일링 중 오류가 발생했습니다");
    } finally {
      setIsUpscaling(false);
    }
  };

  // 탭 변경 시 처리
  const handleTabChange = (tab: "image" | "text") => {
    setActiveTab(tab);
    if (tab === "image") {
      setSelectedEndpoint("luna");
    } else {
      setSelectedEndpoint("veo2");
    }
  };

  // 참조 이미지로 선택할 때 (FolderSidebar의 + 버튼)
  const handleAddReferenceImage = async (fileItem: any) => {
    try {
      if (!fileItem.fileUrl) {
        throw new Error("fileUrl이 존재하지 않는 파일");
      }
      // 참조 이미지 URL을 그대로 상태에 저장
      setReferenceImageUrl(fileItem.fileUrl);
      setReferenceImageFile(null);
      console.log("참조 이미지로 추가되었습니다:", fileItem.name);
      toast.success("참조 이미지로 설정되었습니다");
    } catch (error: any) {
      console.error("참조 이미지 추가 오류:", error);
      setReferenceImageFile(null);
      setReferenceImageUrl("");
    }
  };

  // 파일 input 변경 시 처리 (참조 이미지 직접 선택)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReferenceImageFile(file);
    const preview = URL.createObjectURL(file);
    setReferenceImageUrl(preview);
  };

  // 파일 input 엘리먼트 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 선택 버튼 클릭 시 file input 클릭
  const selectImage = () => {
    fileInputRef.current?.click();
  };

  // 선택한 이미지 제거
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
    setActiveTab,
    selectedEndpoint,
    setSelectedEndpoint,
    quality,
    setQuality,
    style,
    setStyle,
    referenceImageFile,
    referenceImageUrl,
    referencePrompt,
    referenceModel,
    handleSidebarSubmit,
    handleUpscaleVideo,
    handleTabChange,
    handleAddReferenceImage,
    handleImageChange,
    fileInputRef,
    selectImage,
    removeImage,
  };
}
