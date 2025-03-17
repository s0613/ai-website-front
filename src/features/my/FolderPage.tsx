"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { ArrowLeft, Folder, FileText } from "lucide-react";
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
      toast.error("파일 목록을 불러오는데 실패했습니다");
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
    }
  };

  return (
    <div className="p-6">
      {/* 헤더: 뒤로가기 + 폴더 이름 */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-0 mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {folderName || `폴더 ${folderId}`}
        </h1>
      </div>

      {/* 업로드 버튼 */}
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={handleUploadButtonClick}>
            파일 업로드
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={uploadFile}
          />
        </div>
      </div>

      {/* 폴더 내 파일 목록 */}
      {files.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="border rounded-lg p-4 flex flex-col hover:border-blue-500 transition-all"
            >
              {file.fileUrl && isImageFile(file.fileName) ? (
                <div className="mb-3 w-full aspect-square relative overflow-hidden rounded">
                  <Image
                    src={file.fileUrl}
                    alt={file.fileName}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-3">
                  {isImageFile(file.fileName) ? (
                    <Folder className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              )}

              <span className="font-medium">{file.fileName}</span>
              {file.createdAt && (
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(file.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <Folder className="h-12 w-12 mb-3" />
          <p>폴더 내에 파일이 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default FolderPage;
