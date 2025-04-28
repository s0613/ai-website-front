"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { FolderService, FileResponse } from "./services/FolderService";
import { Card } from "@/components/ui/card";

const FolderInPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const folderName = searchParams.get("folderName");

  const [files, setFiles] = useState<FileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (folderId) {
      fetchFiles();
    }
  }, [folderId]);

  const fetchFiles = async () => {
    if (!folderId) return;

    try {
      setIsLoading(true);
      setError(null);
      const filesData = await FolderService.getFilesByFolder(Number(folderId));
      setFiles(filesData);
    } catch (error) {
      console.error("파일 로딩 오류:", error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED') {
        setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
      } else if (error && typeof error === 'object' && 'response' in error && error.response) {
        const response = error.response as { status: number; statusText: string };
        setError(`서버 오류: ${response.status} - ${response.statusText}`);
      } else if (error && typeof error === 'object' && 'request' in error && error.request) {
        setError("서버로부터 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.");
      } else {
        setError("요청 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/my/folder/my");
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderId) return;

    try {
      await FolderService.deleteFolder(Number(folderId));
      toast.success("폴더가 삭제되었습니다");
      router.push("/my/folder");
    } catch (error) {
      console.error("폴더 삭제 오류:", error);
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const response = error.response as { data?: { message?: string }; status?: number };
        if (response.status === 500) {
          toast.error("서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else {
          toast.error("폴더 삭제에 실패했습니다: " + (response.data?.message || "알 수 없는 오류"));
        }
      } else if (error && typeof error === 'object' && 'request' in error) {
        toast.error("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        toast.error("폴더 삭제에 실패했습니다");
      }
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setSelectedFile(file);
    setShowUploadModal(true);
  };

  const handleConfirmUpload = async () => {
    if (!folderId || !selectedFile) {
      return;
    }

    setIsUploading(true);
    setShowUploadModal(false);

    try {
      const response = await FolderService.uploadFile(Number(folderId), selectedFile);
      toast.success(`${selectedFile.name} 파일이 업로드되었습니다`);
      await fetchFiles(); // 파일 목록 새로고침
    } catch (error) {
      console.error("파일 업로드 오류:", error);
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const response = error.response as { data?: { message?: string }; message?: string };
        const errorMessage = response.data?.message || response.message || "알 수 없는 오류";
        console.error('업로드 에러 상세:', errorMessage);
        toast.error(`파일 업로드에 실패했습니다: ${errorMessage}`);
      } else {
        toast.error("파일 업로드에 실패했습니다");
      }
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 max-w-6xl bg-black">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-black/60"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{folderName || "폴더"}</h1>
            <p className="text-gray-400">
              {files.length}개의 파일
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="파일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/40 backdrop-blur-xl border-white/20 text-white w-64"
            />
          </div>
          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
            >
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white"
                type="button"
                disabled={isUploading}
                onClick={() => {
                  document.getElementById('file-upload')?.click();
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    파일 업로드
                  </>
                )}
              </Button>
            </label>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-black/60"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/40 backdrop-blur-xl border-white/20">
              <DropdownMenuItem
                className="text-red-400 hover:bg-black/60"
                onClick={handleDeleteClick}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Loader2 className="h-10 w-10 mx-auto mb-2 text-sky-400 animate-spin" />
                <p className="text-white">Loading files...</p>
                <p className="text-sm text-gray-400">Please wait</p>
              </div>
            </div>
          </Card>
        ) : error ? (
          <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center h-32">
              <div className="bg-red-500 text-red-500 rounded-full p-4 mb-4">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                오류가 발생했습니다
              </h3>
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white"
                onClick={fetchFiles}
              >
                다시 시도
              </Button>
            </div>
          </Card>
        ) : filteredFiles.length === 0 ? (
          <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto mb-4 text-gray-400 flex items-center justify-center">
                <Upload className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No files yet</h3>
              <p className="text-gray-400 mb-4">
                Upload your first file to get started
              </p>
              <div className="relative">
                <input
                  type="file"
                  id="file-upload-empty"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*"
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload-empty"
                  className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
                >
                  <Button
                    className="bg-sky-500 hover:bg-sky-600 text-white"
                    type="button"
                    disabled={isUploading}
                    onClick={() => {
                      document.getElementById('file-upload-empty')?.click();
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </>
                    )}
                  </Button>
                </label>
              </div>
            </div>
          </Card>
        ) : (
          filteredFiles.map((file) => (
            <Card
              key={file.id}
              className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl hover:border-white/30 transition-all duration-300"
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white truncate max-w-[150px]">{file.name}</h3>
                </div>
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                  {file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-800">
                      <Upload className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 업로드 확인 모달 */}
      {showUploadModal && selectedFile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">파일 업로드 확인</h3>
            <p className="text-gray-300 mb-4">
              다음 파일을 업로드하시겠습니까?<br />
              <span className="font-medium">{selectedFile.name}</span>
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={handleCancelUpload}
              >
                취소
              </Button>
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white"
                onClick={handleConfirmUpload}
              >
                업로드
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">폴더 삭제 확인</h3>
            <p className="text-gray-300 mb-4">
              정말로 이 폴더를 삭제하시겠습니까?<br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                취소
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteFolder}
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderInPage;
