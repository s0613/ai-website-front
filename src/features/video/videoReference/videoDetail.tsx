"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Link as LinkIcon, Calendar, Eye, Info, Layers, ExternalLink } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { getVideoById, updateVideoLike } from "../services/MyVideoService";
import type { VideoDto } from "../types/Video";

// 기본 비디오 정보 인터페이스
interface VideoBasicInfo {
  id: number;
  name: string;
  thumbnailUrl: string;
  creator: string;
}

interface VideoDetailProps {
  videoId: number;
  videoBasicInfo: VideoBasicInfo;
}

export default function VideoDetail({ videoId, videoBasicInfo }: VideoDetailProps) {
  const router = useRouter();
  const [videoDetail, setVideoDetail] = useState<VideoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(videoDetail?.liked || false);
  const [likeCount, setLikeCount] = useState(videoDetail?.likeCount || 0);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) return;
      setIsLoading(true);
      try {
        const data = await getVideoById(videoId);
        setVideoDetail(data);
        setIsLiked(data.liked || false);
        setLikeCount(data.likeCount || 0);
      } catch {
        toast.error("비디오 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);

  const handleLikeToggle = async () => {
    if (!videoDetail) return;

    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus);
    setLikeCount((prev: number) => newLikedStatus ? prev + 1 : prev - 1);

    try {
      const updatedVideo = await updateVideoLike(videoDetail.id!, newLikedStatus);
      setIsLiked(updatedVideo.liked || false);
      setLikeCount(updatedVideo.likeCount || 0);
    } catch {
      toast.error("좋아요 상태 변경에 실패했습니다.");
      setIsLiked(!newLikedStatus);
      setLikeCount((prev: number) => !newLikedStatus ? prev + 1 : prev - 1);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("링크가 클립보드에 복사되었습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const handleReuseVideo = () => {
    if (!videoDetail) return;
    const params = new URLSearchParams({
      prompt: videoDetail.prompt || "",
      imageUrl: videoDetail.thumbnailUrl || "",
      model: videoDetail.model || "luna",
    });
    router.push(`/generation/video?${params.toString()}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!videoDetail) {
    return <div>비디오 정보를 불러올 수 없습니다.</div>;
  }

  const videoUrl = videoDetail?.url || "";
  const shareUrl = videoDetail?.share ? `${window.location.origin}/shared/${videoDetail?.id}` : '';

  return (
    <div className="flex flex-col md:flex-row h-full max-h-[inherit] bg-black/40 backdrop-blur-xl rounded-lg overflow-hidden">
      {/* Video Player Section */}
      <div className="md:w-3/5 lg:w-2/3 bg-black flex items-center justify-center p-4">
        {videoUrl ? (
          <video controls src={videoUrl} className="max-w-full max-h-[80vh] object-contain" poster={videoDetail?.thumbnailUrl || videoBasicInfo.thumbnailUrl}></video>
        ) : (
          <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black/50 flex items-center justify-center">
            <Image
              src={videoBasicInfo.thumbnailUrl}
              alt={videoBasicInfo.name}
              width={640}
              height={360}
              className="object-contain max-w-full max-h-[80vh]"
            />
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="md:w-2/5 lg:w-1/3 p-4 md:p-6 overflow-y-auto border-l border-white/10 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-white break-words">
              {videoDetail?.name || videoBasicInfo.name}
            </h2>
          </div>

          {/* Creator Info */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-sm text-gray-400">By {videoDetail?.creator || videoBasicInfo.creator}</span>
          </div>

          {/* Stats and Info */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <InfoItem icon={<Calendar className="w-4 h-4" />} label="생성일" value={new Date(videoDetail?.createdAt || Date.now()).toLocaleDateString()} />
            <InfoItem icon={<Eye className="w-4 h-4" />} label="조회수" value={(videoDetail?.clickCount || 0).toLocaleString()} />
            <InfoItem icon={<Layers className="w-4 h-4" />} label="모델" value={videoDetail?.model || 'N/A'} />
            <InfoItem icon={<Info className="w-4 h-4" />} label="모드" value={videoDetail?.mode || 'N/A'} />
          </div>

          {/* Prompt Section */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">프롬프트</h3>
            <p className="text-xs text-white bg-black/20 p-2 rounded border border-white/10 max-h-20 overflow-y-auto">
              {videoDetail?.prompt || "프롬프트 정보 없음"}
            </p>
          </div>

          {/* Tags Section */}
          {/*
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">태그</h3>
            <div className="flex flex-wrap gap-1">
              {(videoDetail?.tags || []).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
              {(videoDetail?.tags?.length === 0) && <span className="text-xs text-gray-500">태그 없음</span>}
            </div>
          </div>
          */}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={handleLikeToggle}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${isLiked ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            {likeCount.toLocaleString()} 좋아요
          </button>
          <button
            onClick={handleReuseVideo}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            이 영상으로 새로 만들기
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => videoDetail?.share && shareUrl && copyToClipboard(shareUrl)}
              disabled={!videoDetail?.share || !shareUrl}
              className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title={videoDetail?.share ? "공유 링크 복사" : "공유되지 않은 영상"}
            >
              <LinkIcon className="w-4 h-4 mr-2" /> 복사
            </button>
            <button
              onClick={() => videoDetail?.share && shareUrl && window.open(shareUrl, '_blank')}
              disabled={!videoDetail?.share || !shareUrl}
              className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title={videoDetail?.share ? "공유 링크 열기" : "공유되지 않은 영상"}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> 열기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for info items
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="flex items-center space-x-2">
    <div className="text-gray-400">{icon}</div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs font-medium text-white">{value}</p>
    </div>
  </div>
);
