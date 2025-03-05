"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

// 폴더 타입 정의
interface Folder {
  id: number;
  name: string;
  createdAt?: string;
}

const VideoPage = () => {
  // 상태 관리
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 컴포넌트 마운트 시 폴더 목록 가져오기
  useEffect(() => {
    fetchFolders();
  }, []);

  // 폴더 목록 가져오기
  const fetchFolders = async () => {
    try {
      // 경로를 /api/my/folder에서 /api/folders로 변경
      const response = await fetch("/api/folders", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("폴더 목록을 가져오는데 실패했습니다");
      }

      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("폴더 로딩 오류:", error);
      toast.error("폴더 목록을 불러오는데 실패했습니다");
    }
  };

  // 폴더 생성
  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("폴더 이름을 입력해주세요");
      return;
    }

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (!response.ok) {
        throw new Error("폴더 생성에 실패했습니다");
      }

      const newFolder = await response.json();
      setFolders([...folders, newFolder]);
      setNewFolderName("");
      setIsCreateFolderOpen(false);
      toast.success("폴더가 생성되었습니다");
    } catch (error) {
      console.error("폴더 생성 오류:", error);
      toast.error("폴더 생성에 실패했습니다");
    }
  };

  // 폴더 삭제
  const deleteFolder = async (folderId: number) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("폴더 삭제에 실패했습니다");
      }

      // 삭제 성공 시 목록에서 제거
      setFolders(folders.filter((folder) => folder.id !== folderId));
      toast.success("폴더가 삭제되었습니다");
    } catch (error) {
      console.error("폴더 삭제 오류:", error);
      toast.error("폴더 삭제에 실패했습니다");
    }
  };

  // 파일 업로드 핸들러
  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 영상</h1>
        <div className="flex gap-2">
          <Button variant="default" className="gap-2">
            <Plus className="h-4 w-4" />새 영상 생성
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleUploadButtonClick}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            영상 업로드
          </Button>

          {/* 폴더 생성 버튼 */}
          <Dialog
            open={isCreateFolderOpen}
            onOpenChange={setIsCreateFolderOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                <Folder className="h-4 w-4" />
                폴더 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 폴더 생성</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="폴더 이름"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateFolderOpen(false)}
                >
                  취소
                </Button>
                <Button onClick={createFolder}>생성</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="video/*"
            onChange={(e) => {
              // 업로드 로직 구현
              console.log(e.target.files);
            }}
          />
        </div>
      </div>

      {/* 폴더 목록 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="border rounded-lg p-4 flex flex-col hover:border-blue-500 cursor-pointer transition-all"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{folder.name}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => deleteFolder(folder.id)}>
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              {folder.createdAt &&
                new Date(folder.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* 폴더가 없을 때 */}
      {folders.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <Folder className="h-12 w-12 mb-3" />
          <p>생성된 폴더가 없습니다</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsCreateFolderOpen(true)}
          >
            폴더 생성하기
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
