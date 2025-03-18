"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Folder,
  Video,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Play,
  Download,
  Trash2,
  Loader2,
  Image as ImageIcon,
  File,
  PlusCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { FileItem, FolderSidebarProps } from "@/types/fileTypes";
import { useFolderSidebar } from "../hooks/useFolderSidebar";

const FileIcon = ({ fileType }: { fileType: string; fileUrl?: string }) => {
  switch (fileType) {
    case "folder":
      return <Folder className="h-4 w-4 text-blue-500 mr-2" />;
    case "video":
      return <Video className="h-4 w-4 text-purple-500 mr-2" />;
    case "image":
      return <ImageIcon className="h-4 w-4 text-green-500 mr-2" />;
    default:
      return <File className="h-4 w-4 text-gray-500 mr-2" />;
  }
};

export default function FolderSidebar({
  onFileSelect,
  onDownload,
  onDelete,
  onAddReferenceImage,
}: FolderSidebarProps) {
  const {
    expandedFolders,
    files,
    isLoading,
    error,
    loadingFolders,
    selectedImageId,
    setSelectedImageId,
    activeTab,
    setActiveTab,
    fetchFolders,
    toggleFolder,
  } = useFolderSidebar();

  const renderItems = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        {item.type === "folder" ? (
          <div className="mb-1">
            <div
              className="flex items-center py-1.5 px-2 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => toggleFolder(item.id)}
            >
              <div style={{ width: `${depth * 16}px` }} />
              {loadingFolders.has(item.id) ? (
                <Loader2 className="h-4 w-4 text-gray-500 mr-1 animate-spin" />
              ) : expandedFolders.has(item.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 mr-1" />
              )}
              <FileIcon fileType={item.type} fileUrl={item.fileUrl} />
              <span className="text-sm flex-1 truncate">{item.name}</span>
            </div>
            {expandedFolders.has(item.id) && (
              <div className="mt-1">
                {loadingFolders.has(item.id) ? (
                  <div className="flex items-center py-1.5 px-2 ml-6">
                    <p className="text-xs text-gray-500">파일 로딩 중...</p>
                  </div>
                ) : !item.children || item.children.length === 0 ? (
                  <div className="flex items-center py-1.5 px-2 ml-6">
                    <p className="text-xs text-gray-500">파일이 없습니다</p>
                  </div>
                ) : (
                  renderItems(item.children, depth + 1)
                )}
              </div>
            )}
          </div>
        ) : (
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                className={`flex items-center py-1.5 px-2 rounded hover:bg-gray-100 cursor-pointer ${
                  item.type === "image" && selectedImageId === item.id
                    ? "bg-blue-50"
                    : ""
                }`}
                onClick={() => {
                  onFileSelect?.(item);
                }}
              >
                <div style={{ width: `${depth * 16}px` }} />
                <div className="w-4 mr-1" />
                {item.type === "image" && onAddReferenceImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 ml-1 hover:bg-blue-100 hover:text-blue-700 transition-all ${
                      selectedImageId === item.id
                        ? "bg-blue-100 text-blue-700"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddReferenceImage(item);
                      toast.success("참조 이미지로 설정되었습니다");
                      setSelectedImageId(item.id);
                      setTimeout(() => {
                        if (selectedImageId === item.id) {
                          setSelectedImageId(null);
                        }
                      }, 3000);
                    }}
                    title="이 이미지를 참조 이미지로 추가"
                  >
                    {selectedImageId === item.id ? (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    ) : (
                      <PlusCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </Button>
                )}
                <FileIcon fileType={item.type} fileUrl={item.fileUrl} />
                <span className="text-sm flex-1 truncate">{item.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onFileSelect?.(item)}>
                      {item.type === "video" ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          <span>재생</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          <span>보기</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    {item.type === "image" && onAddReferenceImage && (
                      <DropdownMenuItem
                        onClick={() => {
                          onAddReferenceImage(item);
                          toast.success("참조 이미지로 설정되었습니다");
                          setSelectedImageId(item.id);
                          setTimeout(() => {
                            if (selectedImageId === item.id) {
                              setSelectedImageId(null);
                            }
                          }, 3000);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-blue-500">
                          참조 이미지로 추가
                        </span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDownload?.(item)}>
                      <Download className="h-4 w-4 mr-2" />
                      <span>다운로드</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete?.(item)}>
                      <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-red-500">삭제</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onFileSelect?.(item)}>
                {item.type === "video" ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    <span>재생</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    <span>보기</span>
                  </>
                )}
              </ContextMenuItem>
              {item.type === "image" && onAddReferenceImage && (
                <ContextMenuItem
                  onClick={() => {
                    onAddReferenceImage(item);
                    toast.success("참조 이미지로 설정되었습니다");
                    setSelectedImageId(item.id);
                    setTimeout(() => {
                      if (selectedImageId === item.id) {
                        setSelectedImageId(null);
                      }
                    }, 3000);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-blue-500">참조 이미지로 추가</span>
                </ContextMenuItem>
              )}
              <ContextMenuItem onClick={() => onDownload?.(item)}>
                <Download className="h-4 w-4 mr-2" />
                <span>다운로드</span>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onDelete?.(item)}>
                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-red-500">삭제</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
    ));
  };

  return (
    <div className="w-[260px] h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      <div className="border-b border-gray-200 p-2">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full h-9 px-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="myFolder">내 폴더</option>
          <option value="imageToVideo">이미지→비디오</option>
          <option value="videoToVideo">비디오→비디오</option>
          <option value="textToVideo">텍스트→비디오</option>
        </select>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 pb-6">
          {activeTab === "myFolder" ? (
            isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                <p className="text-sm text-gray-500">
                  폴더 목록을 불러오는 중...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-red-500">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={fetchFolders}
                >
                  다시 시도
                </Button>
              </div>
            ) : files.length > 0 ? (
              renderItems(files)
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Folder className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">생성된 영상이 없습니다</p>
                <p className="text-xs text-gray-400 mt-1">
                  새로운 영상을 생성해보세요
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              {activeTab === "imageToVideo" && (
                <>
                  <ImageIcon className="h-12 w-12 text-blue-300 mb-2" />
                  <p className="text-sm text-gray-700">이미지 투 비디오</p>
                </>
              )}
              {activeTab === "videoToVideo" && (
                <>
                  <Video className="h-12 w-12 text-purple-300 mb-2" />
                  <p className="text-sm text-gray-700">비디오 투 비디오</p>
                </>
              )}
              {activeTab === "textToVideo" && (
                <>
                  <FileText className="h-12 w-12 text-green-300 mb-2" />
                  <p className="text-sm text-gray-700">텍스트 투 비디오</p>
                </>
              )}
              <p className="text-xs text-gray-400 mt-2">
                이 기능은 추후 업데이트 예정입니다
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
