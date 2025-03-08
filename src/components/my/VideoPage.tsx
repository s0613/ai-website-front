"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, MoreHorizontal } from "lucide-react";
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

// 폴더 타입 정의
interface FolderType {
  id: number; // 폴더 식별자
  name: string; // 폴더 이름
  createdAt?: string;
}

const VideoPage = () => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  // 1) 마운트 시 폴더 목록 불러오기
  useEffect(() => {
    fetchFolders();
  }, []);

  // 2) 폴더 목록 조회 API
  const fetchFolders = async () => {
    try {
      // (예) /api/my/folder GET
      const response = await fetch("/api/my/folder", {
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

  // 3) 폴더 생성
  const createFolder = async (folderName: string) => {
    try {
      // (예) /api/my/folder/create POST
      const res = await fetch("/api/my/folder/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: folderName }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "폴더 생성 오류");
      }

      const data = await res.json();
      console.log("폴더 생성 성공:", data);

      fetchFolders();
      toast.success("폴더가 생성되었습니다.");
      setIsCreateFolderOpen(false);
      setNewFolderName("");
    } catch (err) {
      console.error(err);
      alert("폴더 생성에 실패했습니다.");
    }
  };

  // 4) 폴더 삭제
  const deleteFolder = async (folderId: number) => {
    try {
      // (예) /api/my/folder/{folderId} DELETE
      const response = await fetch(`/api/my/folder/${folderId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("폴더 삭제에 실패했습니다");
      }

      setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
      toast.success("폴더가 삭제되었습니다");
    } catch (error) {
      console.error("폴더 삭제 오류:", error);
      toast.error("폴더 삭제에 실패했습니다");
    }
  };

  return (
    <div className="p-6">
      {/* 상단 영역 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 영상</h1>

        <div className="flex gap-2">
          {/* 예시용: 새 영상 생성 버튼(미구현) */}
          <Button variant="default" className="gap-2">
            <Plus className="h-4 w-4" /> 새 영상 생성
          </Button>

          {/* 폴더 생성 버튼 (Dialog) */}
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
                <Button
                  variant="default"
                  onClick={() => createFolder(newFolderName)}
                >
                  생성
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 폴더 목록 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {folders.map((folder) => (
          // folder.id로 이동하면서, folder.name도 query로 넘겨주어
          // 상세 페이지에서 초기 제목으로 활용할 수 있게 함
          <Link
            key={folder.id}
            href={{
              pathname: `/my/folder/${folder.id}`,
              query: { folderName: folder.name },
            }}
          >
            <div className="border rounded-lg p-4 flex flex-col hover:border-blue-500 cursor-pointer transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{folder.name}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder.id);
                      }}
                    >
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
          </Link>
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
