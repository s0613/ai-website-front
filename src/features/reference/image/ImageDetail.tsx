"use client";

import { useRouter } from "next/navigation";
import {
  formatFileSize,
  formatDate,
} from "@/features/reference/video/utils/formatUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface ImageDetailProps {
  image: {
    id: number;
    name: string;
    prompt: string;
    url: string;
    thumbnailUrl: string;
    format: string;
    sizeInBytes: number;
    status: string;
    createdAt: string;
    creator?: string;
    model?: string;
  };
  onBack: () => void;
}

export default function ImageDetail({ image, onBack }: ImageDetailProps) {
  const router = useRouter();

  // 이미지 재사용 핸들러
  const handleReuseImage = () => {
    // 필요한 정보를 쿼리 파라미터로 인코딩
    const params = new URLSearchParams({
      prompt: image.prompt || "",
      imageUrl: image.url || "",
      model: image.model || "stable-diffusion",
    });

    // 이미지 생성 페이지로 이동
    router.push(`/generation/image?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* 이미지 뷰어 */}
      <div className="md:w-3/5 bg-black flex items-center justify-center p-4">
        <img
          src={image.url}
          alt={image.name}
          className="max-h-[70vh] w-full object-contain"
        />
      </div>

      {/* 이미지 정보 */}
      <div className="md:w-2/5 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            ← 돌아가기
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">{image.name}</h2>
        <p className="text-gray-600 mb-4">{image.creator || "알 수 없음"}</p>

        <div className="space-y-4">
          {/* 프롬프트 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">프롬프트</h3>
            <ScrollArea className="h-[120px]">
              <p className="text-gray-700 pr-4">
                {image.prompt || "프롬프트 정보가 없습니다."}
              </p>
            </ScrollArea>
          </div>

          {/* 메타데이터 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            {image.model && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">모델</h3>
                <p className="mt-1">{image.model}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500">생성일</h3>
              <p className="mt-1">{formatDate(image.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">파일 형식</h3>
              <p className="mt-1">{image.format}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">파일 크기</h3>
              <p className="mt-1">{formatFileSize(image.sizeInBytes)}</p>
            </div>
          </div>

          {/* 작업 버튼 */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(image.url, "_blank")}
            >
              다운로드
            </Button>
            <Button className="flex-1" onClick={handleReuseImage}>
              이 설정으로 생성
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
