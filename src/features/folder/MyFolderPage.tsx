"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Folder,
  MoreHorizontal,
  Loader2,
  Trash2,
  AlertTriangle,
  FileVideo,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import {
  getFolders,
  createFolder as createFolderService,
  deleteFolder as deleteFolderService,
} from "./services/FolderService";
import { Folder as FolderType } from "./types/Folder";

const MyFolderPage = () => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) 마운트 시 폴더 목록 불러오기
  useEffect(() => {
    fetchFolders();
  }, []);

  // 2) 폴더 목록 조회 API - FolderService 사용
  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // FolderService의 getFolders 함수 호출
      const data = await getFolders();
      setFolders(data);
    } catch (error) {
      console.error("폴더 로딩 오류:", error);
      setError(
        (error as Error).message || "폴더 목록을 불러오는데 실패했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 3) 폴더 생성 - FolderService 사용
  const createFolder = async (folderName: string) => {
    if (!folderName.trim()) {
      toast.error("폴더 이름을 입력해주세요");
      return;
    }

    try {
      // FolderService의 createFolder 함수 호출
      await createFolderService(folderName);

      // 폴더 목록 다시 불러오기
      fetchFolders();

      toast.success("폴더가 생성되었습니다");
      setIsCreateFolderOpen(false);
      setNewFolderName("");
    } catch (err) {
      console.error(err);
      toast.error("폴더 생성에 실패했습니다");
    }
  };

  // 4) 폴더 삭제 - FolderService 사용
  const deleteFolder = async (folderId: number) => {
    try {
      // FolderService의 deleteFolder 함수 호출
      await deleteFolderService(folderId);

      // 폴더 목록 상태 업데이트
      setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
      toast.success("폴더가 삭제되었습니다");
    } catch (error) {
      console.error("폴더 삭제 오류:", error);
      toast.error("폴더 삭제에 실패했습니다");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 p-6">
      {/* 상단 영역 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 폴더</h1>
          <p className="text-sm text-gray-500 mt-1">
            영상과 이미지를 폴더로 관리하세요
          </p>
        </div>

        <div className="flex gap-2">
          {/* 새 영상 생성 버튼 */}
          <Link href="/generation/video">
            <Button className="gap-2 bg-sky-500 hover:bg-sky-600 text-white">
              <Plus className="h-4 w-4" /> 새 영상 생성
            </Button>
          </Link>

          {/* 폴더 생성 버튼 (Dialog) */}
          <Dialog
            open={isCreateFolderOpen}
            onOpenChange={setIsCreateFolderOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-gray-200 hover:border-sky-200 hover:bg-sky-50"
              >
                <Folder className="h-4 w-4 text-sky-500" />
                폴더 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  새 폴더 생성
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="폴더 이름"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="focus:border-sky-300 focus:ring-sky-200"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateFolderOpen(false)}
                  className="border-gray-200"
                >
                  취소
                </Button>
                <Button
                  onClick={() => createFolder(newFolderName)}
                  className="bg-sky-500 hover:bg-sky-600 text-white"
                >
                  생성
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">
              폴더 목록을 불러오는 중...
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
              onClick={fetchFolders}
            >
              다시 시도
            </Button>
          </div>
        ) : folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="bg-sky-50 text-sky-500 rounded-full p-4 mb-4">
              <Folder className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              생성된 폴더가 없습니다
            </h3>
            <p className="text-gray-500 mb-5 max-w-md">
              새로운 폴더를 생성하여 영상과 이미지를 관리해보세요
            </p>
            <Button
              className="bg-sky-500 hover:bg-sky-600 text-white"
              onClick={() => setIsCreateFolderOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> 폴더 생성하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {folders.map((folder) => (
              <Link
                key={folder.id}
                href={{
                  pathname: `/my/folder/${folder.id}`,
                  query: { folderName: folder.name },
                }}
                className="block w-full"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 hover:shadow-md hover:border-sky-200 transition-all duration-200 cursor-pointer overflow-hidden group h-full flex flex-col">
                  {/* 썸네일 영역 */}
                  <div className="aspect-[4/3] bg-sky-50 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent"></div>
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // 폴더 이동 기능 (예시)
                            }}
                          >
                            <FileVideo className="h-4 w-4 mr-2 text-gray-500" />
                            <span>영상 추가</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteFolder(folder.id);
                            }}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>폴더 삭제</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      <Folder className="h-20 w-20 text-sky-500" />
                    </div>
                  </div>

                  {/* 폴더 정보 */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-medium text-base line-clamp-1 text-gray-900 mb-1">
                      {folder.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFolderPage;
