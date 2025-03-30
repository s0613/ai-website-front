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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVideoById, toggleVideoShare } from "../services/MyVideoService";
import { VideoDto } from "../types/Video";

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

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-8 bg-white/80 rounded-lg">
        <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">작업물을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-white/80 rounded-lg">
        <div className="bg-red-50 text-red-500 rounded-full p-4 mb-4">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          오류가 발생했습니다
        </h3>
        <p className="text-red-500 mb-4 text-center">{error}</p>
        <Button onClick={onBack} variant="outline" className="gap-2">
          <X className="h-4 w-4" />
          돌아가기
        </Button>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="bg-white w-full h-full max-h-[85vh] flex flex-col md:flex-row rounded-xl shadow-md overflow-hidden border border-gray-200/80">
      {/* 왼쪽: 비디오 플레이어 */}
      <div className="md:w-3/5 bg-black flex items-center justify-center">
        <div className="w-full h-full flex items-center">
          <video
            src={video.url}
            controls
            className="w-full max-h-[70vh] object-contain"
            poster={video.thumbnailUrl}
            autoPlay
            controlsList="nodownload"
          >
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
        </div>
      </div>

      {/* 오른쪽: 비디오 정보 */}
      <div className="md:w-2/5 p-6 overflow-y-auto bg-white border-l border-gray-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {video.name}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full h-8 w-8 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        <div className="space-y-5">
          <div className="bg-gray-50/80 p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 mb-2">프롬프트</h3>
            <p className="text-gray-800 whitespace-pre-wrap text-sm">
              {video.prompt || "프롬프트 정보가 없습니다."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoCard
              label="모델"
              value={video.model || "정보 없음"}
              icon={
                <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-500">
                  AI
                </div>
              }
            />
            <InfoCard
              label="모드"
              value={video.mode || "정보 없음"}
              icon={
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
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
                  <Globe className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )
              }
            />
          </div>

          {/* 작업 버튼 영역 */}
          <div className="pt-5 border-t border-gray-200 grid grid-cols-2 gap-3">
            <Button
              onClick={handleReuseVideo}
              className="py-2 gap-1.5 bg-gray-900 hover:bg-gray-800 text-white"
            >
              <RefreshCw className="h-4 w-4" />
              재사용하기
            </Button>
            <Button
              onClick={handleToggleShare}
              className={`py-2 gap-1.5 ${
                isSharing
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
  <div className="flex items-center space-x-2.5">
    {icon}
    <div>
      <h3 className="text-xs font-medium text-gray-500">{label}</h3>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  </div>
);
