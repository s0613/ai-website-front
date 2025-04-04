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
import { FileItem, FolderSidebarProps } from "../../types/fileTypes";
import { useFolderSidebar } from "../hooks/useFolderSidebar";

const FileIcon = ({ fileType, fileUrl }: { fileType: string; fileUrl?: string }) => {
  switch (fileType) {
    case "folder":
      return <Folder className="h-4 w-4 text-sky-500 mr-2" />;
    case "video":
      return <Video className="h-4 w-4 text-sky-500 mr-2" />;
    case "image":
      return <ImageIcon className="h-4 w-4 text-sky-500 mr-2" />;
    default:
      return <File className="h-4 w-4 text-gray-400 mr-2" />;
  }
};

export default function FolderSidebar({
  onFileSelect,
  onDownload,
  onDelete,
  onAddReferenceImage,
  selectedEndpoint,
  quality,
  style,
  onEndpointChange,
  onQualityChange,
  onStyleChange,
  activeTab,
  className,
}: FolderSidebarProps) {
  const {
    expandedFolders,
    files,
    isLoading,
    error,
    loadingFolders,
    selectedImageId,
    setSelectedImageId,
    fetchFolders,
    toggleFolder,
  } = useFolderSidebar();

  const renderItems = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        {item.type === "folder" ? (
          <div className="mb-1">
            <div
              className="flex items-center py-2 px-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
              onClick={() => toggleFolder(item.id)}
            >
              <div style={{ width: `${depth * 16}px` }} />
              {loadingFolders.has(item.id) ? (
                <Loader2 className="h-4 w-4 text-sky-500 mr-1.5 animate-spin" />
              ) : expandedFolders.has(item.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-400 mr-1.5 group-hover:text-sky-500 transition-colors" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400 mr-1.5 group-hover:text-sky-500 transition-colors" />
              )}
              <FileIcon fileType={item.type} fileUrl={item.fileUrl} />
              <span className="text-sm font-medium flex-1 truncate text-white group-hover:text-sky-500 transition-colors">
                {item.name}
              </span>
            </div>
            {expandedFolders.has(item.id) && (
              <div className="mt-1 ml-4 pl-2 border-l-2 border-white/10">
                {loadingFolders.has(item.id) ? (
                  <div className="flex items-center py-2 px-3">
                    <p className="text-xs text-gray-400 flex items-center">
                      <Loader2 className="h-3 w-3 mr-1.5 text-sky-500 animate-spin" />
                      파일 로딩 중...
                    </p>
                  </div>
                ) : !item.children || item.children.length === 0 ? (
                  <div className="flex items-center py-2 px-3">
                    <p className="text-xs text-gray-400 italic">
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
                className={`flex items-center py-2 px-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors ${item.type === "image" && selectedImageId === item.id
                  ? "bg-sky-500/20 ring-1 ring-sky-500/50"
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
                    className={`h-6 w-6 p-0 mr-1 hover:bg-sky-500/20 hover:text-sky-500 transition-all rounded-full ${selectedImageId === item.id ? "bg-sky-500/20 text-sky-500" : ""
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddReferenceImage(item);
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
                <span className="text-sm flex-1 truncate text-white hover:text-sky-500">
                  {item.name}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-black/80 backdrop-blur-md border border-white/10">
                    <DropdownMenuItem onClick={() => onFileSelect?.(item)} className="text-white hover:bg-white/10">
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
                          setSelectedImageId(item.id);
                          setTimeout(() => {
                            if (selectedImageId === item.id) {
                              setSelectedImageId(null);
                            }
                          }, 3000);
                        }}
                        className="text-white hover:bg-white/10"
                      >
                        <PlusCircle className="h-4 w-4 mr-2 text-sky-500" />
                        <span className="text-sky-500 font-medium">
                          참조 이미지로 추가
                        </span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDownload?.(item)} className="text-white hover:bg-white/10">
                      <Download className="h-4 w-4 mr-2" />
                      <span>다운로드</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(item)}
                      className="text-red-400 hover:bg-white/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>삭제</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 bg-black/80 backdrop-blur-md border border-white/10">
              <ContextMenuItem onClick={() => onFileSelect?.(item)} className="text-white hover:bg-white/10">
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
                    setSelectedImageId(item.id);
                    setTimeout(() => {
                      if (selectedImageId === item.id) {
                        setSelectedImageId(null);
                      }
                    }, 3000);
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <PlusCircle className="h-4 w-4 mr-2 text-sky-500" />
                  <span className="text-sky-500 font-medium">
                    참조 이미지로 추가
                  </span>
                </ContextMenuItem>
              )}
              <ContextMenuItem onClick={() => onDownload?.(item)} className="text-white hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                <span>다운로드</span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => onDelete?.(item)}
                className="text-red-400 hover:bg-white/10"
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
    <div className={`w-[280px] h-full bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)] ${className || ''}`}>
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white flex items-center">
          <span className="inline-block w-1.5 h-4 bg-sky-500 mr-3 rounded-full"></span>
          내 보관함
        </h2>
      </div>
      <ScrollArea className="flex-1 [&_.simplebar-scrollbar]:bg-white/5 [&_.simplebar-scrollbar]:hover:bg-white/10 [&_.simplebar-scrollbar]:before:bg-white/5 [&_.simplebar-scrollbar]:before:hover:bg-white/10 [&_.simplebar-scrollbar]:w-1.5 [&_.simplebar-scrollbar]:rounded-full">
        <div className="p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10">
                <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-2">{error}</p>
              <Button
                onClick={() => fetchFolders()}
                className="bg-sky-500/20 backdrop-blur-md hover:bg-sky-500/30 text-white border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                다시 시도
              </Button>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">폴더가 없습니다</p>
              <Button
                onClick={() => fetchFolders()}
                className="bg-sky-500/20 backdrop-blur-md hover:bg-sky-500/30 text-white border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                새로고침
              </Button>
            </div>
          ) : (
            renderItems(files)
          )}
        </div>
      </ScrollArea>
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
