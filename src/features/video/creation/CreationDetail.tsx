"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { formatFileSize, formatDate } from "@/features/video/types/formatUtils";
import { toast } from "react-hot-toast";
import {
  X,
  Loader2,
  AlertTriangle,
  Calendar,
  Eye,
  Heart,
  Share2,
  Lock,
  RefreshCw,
  Globe,
  Download,
  ArrowUpToLine,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVideoById, toggleVideoShare } from "../services/MyVideoService";
import { VideoDto } from "../types/Video";
import { upscaleVideo } from "../services/GenerateService";

interface CreationDetailProps {
  videoId: number;
  onBack: () => void;
}

export default function CreationDetail({
  videoId,
  onBack,
}: CreationDetailProps) {
  const router = useRouter();
  const [video, setVideo] = useState<VideoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [hasUpscaled, setHasUpscaled] = useState(false);
  const [upscaledVideoUrl, setUpscaledVideoUrl] = useState("");

  useEffect(() => {
    const fetchVideoDetail = async () => {
      try {
        setIsLoading(true);

        // MyVideoService의 getVideoById 함수 사용
        const videoData = await getVideoById(videoId);
        setVideo(videoData);
        setIsSharing(videoData.share || false);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching video:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetail();
    }
  }, [videoId]);

  // 비디오 재사용 핸들러
  const handleReuseVideo = () => {
    if (!video) return;

    // 필요한 정보를 쿼리 파라미터로 인코딩
    const params = new URLSearchParams({
      prompt: video.prompt || "",
      imageUrl: video.thumbnailUrl || "",
      model: video.model || "luna",
    });

    // 영상 생성 페이지로 이동
    router.push(`/generation/video?${params.toString()}`);
  };

  // 공유 상태 토글 핸들러
  const handleToggleShare = async () => {
    if (!video || !video.id) return;

    try {
      // MyVideoService의 toggleVideoShare 함수 사용
      const updatedVideo = await toggleVideoShare(video.id, !isSharing);

      // API 응답에서 shared 필드를 확인하고 상태 업데이트
      const newSharingStatus = updatedVideo.share || false;
      setIsSharing(newSharingStatus);

      // 성공 메시지 표시
      const status = newSharingStatus ? "공개" : "비공개";
      toast.success(`영상이 ${status}로 설정되었습니다`);

      // 비디오 객체도 업데이트
      setVideo(updatedVideo);
    } catch (err) {
      console.error("Error updating share status:", err);
      toast.error("공유 상태를 변경하는데 실패했습니다");
    }
  };

  // 다운로드 핸들러
  const handleDownload = () => {
    if (!video || !video.url) return;

    const link = document.createElement("a");
    link.href = video.url;
    link.download = `${video.name || "video"}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 업스케일링 처리 함수
  const handleUpscaleVideo = async () => {
    if (!video?.url) return;

    try {
      setIsUpscaling(true);
      setUpscaledVideoUrl("");
      const result = await upscaleVideo(video.url);
      if (result.data && result.data.video_upscaled) {
        setUpscaledVideoUrl(result.data.video_upscaled);
        setHasUpscaled(true);
        toast.success("비디오 업스케일링이 완료되었습니다!");
      } else {
        throw new Error("업스케일링된 비디오 URL을 찾을 수 없습니다");
      }
    } catch (error: unknown) {
      console.error("비디오 업스케일링 오류:", error);
      toast.error(error instanceof Error ? error.message : "업스케일링 중 오류가 발생했습니다");
    } finally {
      setIsUpscaling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-8 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20">
        <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">작업물을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20">
        <div className="bg-red-500/20 text-red-400 rounded-full p-4 mb-4">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          오류가 발생했습니다
        </h3>
        <p className="text-red-400 mb-4 text-center">{error}</p>
        <Button onClick={onBack} variant="outline" className="gap-2 bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60">
          <X className="h-4 w-4" />
          돌아가기
        </Button>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="bg-black/40 backdrop-blur-xl w-full h-full max-h-[85vh] flex flex-col md:flex-row rounded-xl border border-white/20 overflow-hidden">
      {/* 왼쪽: 비디오 플레이어 */}
      <div className="md:w-3/5 bg-black flex items-center justify-center">
        <div className="w-full h-full flex items-center">
          <video
            src={upscaledVideoUrl || video?.url}
            controls
            className="w-full max-h-[70vh] object-contain"
            poster={video?.thumbnailUrl}
            autoPlay
            controlsList="nodownload"
          >
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
        </div>
      </div>

      {/* 오른쪽: 비디오 정보 */}
      <div className="md:w-2/5 p-6 overflow-y-auto bg-black/40 backdrop-blur-xl border-l border-white/20">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-white leading-tight">
            {video.name}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full h-8 w-8 hover:bg-black/60 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-5">
          <div className="bg-black/40 backdrop-blur-xl p-4 rounded-lg border border-white/20">
            <h3 className="text-sm font-medium text-gray-400 mb-2">프롬프트</h3>
            <div className="max-h-[100px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-black/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
              <p className="text-white whitespace-pre-wrap text-sm pr-2">
                {video.prompt || "프롬프트 정보가 없습니다."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoCard
              label="모델"
              value={video.model || "정보 없음"}
              icon={
                <div className="w-6 h-6 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400">
                  AI
                </div>
              }
            />
            <InfoCard
              label="모드"
              value={video.mode || "정보 없음"}
              icon={
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                  M
                </div>
              }
            />
            <InfoCard
              label="조회수"
              value={(video.clickCount || 0).toLocaleString()}
              icon={<Eye className="h-4 w-4 text-gray-400" />}
            />
            <InfoCard
              label="좋아요"
              value={(video.likeCount || 0).toLocaleString()}
              icon={<Heart className="h-4 w-4 text-gray-400" />}
            />
            <InfoCard
              label="생성일"
              value={formatDate(video.createdAt || "")}
              icon={<Calendar className="h-4 w-4 text-gray-400" />}
            />
            <InfoCard
              label="공유 상태"
              value={isSharing ? "공개" : "비공개"}
              icon={
                isSharing ? (
                  <Globe className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )
              }
            />
          </div>

          {/* 작업 버튼 영역 */}
          <div className="pt-5 border-t border-white/20 grid grid-cols-2 gap-3">
            <Button
              onClick={handleReuseVideo}
              className="py-2 gap-1.5 bg-sky-500 hover:bg-sky-600 text-white"
            >
              <RefreshCw className="h-4 w-4" />
              재사용하기
            </Button>
            <Button
              onClick={handleToggleShare}
              className={`py-2 gap-1.5 ${isSharing
                ? "bg-red-500 hover:bg-red-600"
                : "bg-sky-500 hover:bg-sky-600"
                } text-white`}
            >
              {isSharing ? (
                <>
                  <Lock className="h-4 w-4" />
                  비공개로 전환
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  공개로 전환
                </>
              )}
            </Button>
            <Button
              onClick={handleUpscaleVideo}
              disabled={isUpscaling || hasUpscaled}
              className={`py-2 gap-1.5 ${hasUpscaled
                ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                : "bg-sky-500/20 hover:bg-sky-500/30 text-white"
                } col-span-2 border border-white/10 relative`}
            >
              {isUpscaling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>업스케일링 중...</span>
                </>
              ) : hasUpscaled ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>업스케일링 완료</span>
                </>
              ) : (
                <>
                  <ArrowUpToLine className="h-4 w-4 mr-2" />
                  <span>고화질 업스케일링</span>
                  <span className="absolute right-3 text-sm text-red-400">-1 크레딧</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="py-2 gap-1.5 col-span-2"
            >
              <Download className="h-4 w-4" />
              다운로드
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 정보 카드 컴포넌트
const InfoCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="bg-black/40 backdrop-blur-xl p-3 rounded-lg border border-white/20">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-sm font-medium text-gray-400">{label}</span>
    </div>
    <p className="text-sm text-white">{value}</p>
  </div>
);
