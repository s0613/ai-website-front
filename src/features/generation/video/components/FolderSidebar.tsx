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
import { FileItem, FolderSidebarProps } from "../types/fileTypes";
import { useFolderSidebar } from "../hooks/useFolderSidebar";

const FileIcon = ({ fileType }: { fileType: string; fileUrl?: string }) => {
  switch (fileType) {
    case "folder":
      return <Folder className="h-4 w-4 text-sky-500 mr-2" />;
    case "video":
      return <Video className="h-4 w-4 text-purple-500 mr-2" />;
    case "image":
      return <ImageIcon className="h-4 w-4 text-emerald-500 mr-2" />;
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
              className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              onClick={() => toggleFolder(item.id)}
            >
              <div style={{ width: `${depth * 16}px` }} />
              {loadingFolders.has(item.id) ? (
                <Loader2 className="h-4 w-4 text-sky-500 mr-1.5 animate-spin" />
              ) : expandedFolders.has(item.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-500 mr-1.5 group-hover:text-sky-500 transition-colors" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 mr-1.5 group-hover:text-sky-500 transition-colors" />
              )}
              <FileIcon fileType={item.type} fileUrl={item.fileUrl} />
              <span className="text-sm font-medium flex-1 truncate group-hover:text-sky-600 transition-colors">
                {item.name}
              </span>
            </div>
            {expandedFolders.has(item.id) && (
              <div className="mt-1 ml-4 pl-2 border-l-2 border-gray-100">
                {loadingFolders.has(item.id) ? (
                  <div className="flex items-center py-2 px-3">
                    <p className="text-xs text-gray-500 flex items-center">
                      <Loader2 className="h-3 w-3 mr-1.5 text-sky-500 animate-spin" />
                      파일 로딩 중...
                    </p>
                  </div>
                ) : !item.children || item.children.length === 0 ? (
                  <div className="flex items-center py-2 px-3">
                    <p className="text-xs text-gray-500 italic">
                      파일이 없습니다
                    </p>
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
                className={`flex items-center py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  item.type === "image" && selectedImageId === item.id
                    ? "bg-sky-50 ring-1 ring-sky-200"
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
                    className={`h-6 w-6 p-0 mr-1 hover:bg-sky-100 hover:text-sky-700 transition-all rounded-full ${
                      selectedImageId === item.id
                        ? "bg-sky-100 text-sky-700"
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
                      <CheckCircle className="h-4 w-4 text-sky-500" />
                    ) : (
                      <PlusCircle className="h-4 w-4 text-sky-500" />
                    )}
                  </Button>
                )}
                <FileIcon fileType={item.type} fileUrl={item.fileUrl} />
                <span className="text-sm flex-1 truncate hover:text-gray-900">
                  {item.name}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
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
                        <PlusCircle className="h-4 w-4 mr-2 text-sky-500" />
                        <span className="text-sky-500 font-medium">
                          참조 이미지로 추가
                        </span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDownload?.(item)}>
                      <Download className="h-4 w-4 mr-2" />
                      <span>다운로드</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(item)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>삭제</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
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
                  <PlusCircle className="h-4 w-4 mr-2 text-sky-500" />
                  <span className="text-sky-500 font-medium">
                    참조 이미지로 추가
                  </span>
                </ContextMenuItem>
              )}
              <ContextMenuItem onClick={() => onDownload?.(item)}>
                <Download className="h-4 w-4 mr-2" />
                <span>다운로드</span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onDelete?.(item)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span>삭제</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
    ));
  };

  return (
    <div className="w-[280px] h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">내 보관함</h3>
        <p className="text-sm text-gray-500">생성된 파일을 관리하세요</p>
      </div>

      <div className="p-4 pb-2 border-b border-gray-100">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
        >
          <option value="myFolder">내 폴더</option>
          <option value="imageToVideo">이미지→비디오</option>
          <option value="videoToVideo">비디오→비디오</option>
          <option value="textToVideo">텍스트→비디오</option>
        </select>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 pb-6">
          {activeTab === "myFolder" ? (
            isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-sky-50 text-sky-500 rounded-full p-3 mb-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  폴더 목록을 불러오는 중...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  잠시만 기다려주세요
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-red-50 text-red-500 rounded-full p-3 mb-4">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-red-500 font-medium mb-2">{error}</p>
                <Button
                  onClick={fetchFolders}
                  className="bg-sky-500 hover:bg-sky-600 text-white"
                  size="sm"
                >
                  <RefreshIcon className="w-4 h-4 mr-1.5" />
                  다시 시도
                </Button>
              </div>
            ) : files.length > 0 ? (
              renderItems(files)
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-gray-50 text-gray-400 rounded-full p-3 mb-4">
                  <Folder className="h-10 w-10" />
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">
                  생성된 파일이 없습니다
                </p>
                <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                  새로운 비디오나 이미지를 생성하면 이 곳에 저장됩니다
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div
                className={`rounded-full p-3 mb-4 ${
                  activeTab === "imageToVideo"
                    ? "bg-sky-50 text-sky-500"
                    : activeTab === "videoToVideo"
                    ? "bg-purple-50 text-purple-500"
                    : activeTab === "textToVideo"
                    ? "bg-emerald-50 text-emerald-500"
                    : ""
                }`}
              >
                {activeTab === "imageToVideo" && (
                  <ImageIcon className="h-10 w-10" />
                )}
                {activeTab === "videoToVideo" && (
                  <Video className="h-10 w-10" />
                )}
                {activeTab === "textToVideo" && (
                  <FileText className="h-10 w-10" />
                )}
              </div>
              <p className="text-sm text-gray-700 font-medium mb-1">
                {activeTab === "imageToVideo" && "이미지 → 비디오 변환"}
                {activeTab === "videoToVideo" && "비디오 → 비디오 변환"}
                {activeTab === "textToVideo" && "텍스트 → 비디오 변환"}
              </p>
              <p className="text-xs text-gray-500 max-w-[200px]">
                이 기능은 곧 업데이트 예정입니다. 조금만 기다려주세요!
              </p>
              <Button
                className="mt-4 bg-sky-100 text-sky-600 hover:bg-sky-200"
                size="sm"
              >
                <BellIcon className="w-4 h-4 mr-1.5" />
                업데이트 알림 받기
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-center space-x-2">
          <Button variant="outline" size="sm" className="text-xs flex-1 h-8">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            모두 다운로드
          </Button>
          <Button variant="outline" size="sm" className="text-xs flex-1 h-8">
            <FolderIcon className="h-3.5 w-3.5 mr-1.5" />
            폴더 생성
          </Button>
        </div>
      </div>
    </div>
  );
}

// 필요한 추가 아이콘 컴포넌트
const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
    />
  </svg>
);
