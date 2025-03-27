"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Folder,
  FileText,
  Upload,
  Loader2,
  AlertTriangle,
  Clock,
  MoreHorizontal,
  Download,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

interface FileData {
  id: number;
  fileName: string;
  fileUrl?: string;
  createdAt?: string;
}

// 이미지 파일인지 확인하는 함수
const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return imageExtensions.includes(extension);
};

const FolderPage = () => {
  // 1) /my/folder/[id]의 [id] 추출
  const params = useParams();
  const folderId = params.id as string | undefined;

  // 2) 쿼리 파라미터에서 folderName 가져오기 (초기 제목 표시용)
  const searchParams = useSearchParams();
  const initialFolderName = searchParams.get("folderName") || "";

  // 3) 라우터
  const router = useRouter();

  // 4) 컴포넌트 상태
  const [folderName] = useState(initialFolderName);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 5) 폴더 상세/파일목록 로드
  useEffect(() => {
    if (folderId) {
      fetchFiles(folderId);
    }
  }, [folderId]);

  // 파일 목록 조회
  const fetchFiles = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/files/folder/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("파일 목록을 가져오는데 실패했습니다");
      }

      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("파일 목록 로딩 오류:", error);
      setError(
        (error as Error).message || "파일 목록을 불러오는데 실패했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 업로드 버튼 클릭
  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 실제 파일 업로드 처리
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !folderId) {
      toast.error("업로드할 파일 또는 폴더 정보를 찾을 수 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/files/upload/${folderId}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("파일 업로드에 실패했습니다");
      }

      toast.success("파일이 업로드되었습니다");
      fetchFiles(folderId);
    } catch (error) {
      console.error("파일 업로드 오류:", error);
      toast.error("파일 업로드에 실패했습니다");
    } finally {
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return "날짜 정보 없음";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      {/* 헤더: 뒤로가기 + 폴더 이름 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/my/folder/my")}
            className="p-2 mr-2 text-gray-600 hover:text-sky-600 hover:bg-sky-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center">
              <Folder className="text-sky-500 h-5 w-5 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">
                {folderName || `폴더 ${folderId}`}
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              파일을 관리하고 정리하세요
            </p>
          </div>
        </div>

        {/* 업로드 버튼 */}
        <div className="flex gap-2 items-center">
          <Button
            onClick={handleUploadButtonClick}
            className="gap-2 bg-sky-500 hover:bg-sky-600 text-white"
          >
            <Upload className="h-4 w-4" />
            파일 업로드
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={uploadFile}
          />
        </div>
      </div>

      {/* 폴더 내 파일 목록 */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">
              파일 목록을 불러오는 중...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="bg-red-50 text-red-500 rounded-full p-4 mb-4">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              오류가 발생했습니다
            </h3>
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              className="bg-sky-500 hover:bg-sky-600 text-white"
              onClick={() => fetchFiles(folderId || "")}
            >
              다시 시도
            </Button>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="bg-sky-50 text-sky-500 rounded-full p-4 mb-4">
              <Folder className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              폴더 내에 파일이 없습니다
            </h3>
            <p className="text-gray-500 mb-5 max-w-md">
              새로운 파일을 업로드하여 폴더를 활용해보세요
            </p>
            <Button
              className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
              onClick={handleUploadButtonClick}
            >
              <Upload className="h-4 w-4" />
              파일 업로드하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200/80 hover:shadow-md hover:border-sky-200 transition-all duration-200 overflow-hidden group"
              >
                {/* 파일 미리보기 */}
                <div className="aspect-square relative bg-gray-100 overflow-hidden">
                  {file.fileUrl && isImageFile(file.fileName) ? (
                    <>
                      <Image
                        src={file.fileUrl}
                        alt={file.fileName}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      {isImageFile(file.fileName) ? (
                        <FileText className="h-16 w-16 text-sky-500" />
                      ) : (
                        <FileText className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* 작업 드롭다운 */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {file.fileUrl && (
                          <DropdownMenuItem
                            onClick={() => {
                              if (file.fileUrl) {
                                window.open(file.fileUrl, "_blank");
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2 text-gray-500" />
                            <span>다운로드</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            // 여기에 파일 삭제 기능 구현
                            toast.error("삭제 기능은 아직 구현되지 않았습니다");
                          }}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span>삭제</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* 파일 정보 */}
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
                    {file.fileName}
                  </h3>
                  {file.createdAt && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderPage;
