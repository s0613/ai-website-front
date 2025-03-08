"use client";

import React, { useState } from "react";
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

// 폴더 및 파일을 나타내는 타입
export type FileItem = {
  id: string;
  name: string;
  type: "folder" | "video";
  thumbnailUrl?: string; // 동영상이면 썸네일 URL
  created: Date;
  children?: FileItem[]; // 폴더인 경우에만 존재
};

// 폴더 사이드바 props 타입
export type FolderSidebarProps = {
  files?: FileItem[]; // 기존 파일 데이터는 VideoSetting에서 필요없을 수 있으므로 optional 처리
  onFileSelect?: (file: FileItem) => void;
  onDownload?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
  activeTab: "image" | "text";
  selectedEndpoint: string;
  quality: "standard" | "high";
  style: "realistic" | "creative";
  onEndpointChange: React.Dispatch<React.SetStateAction<string>>;
  onQualityChange: React.Dispatch<React.SetStateAction<"standard" | "high">>;
  onStyleChange: React.Dispatch<React.SetStateAction<"realistic" | "creative">>;
};

export default function FolderSidebar({
  files = [], // 기본값으로 빈 배열 제공
  onFileSelect,
  onDownload,
  onDelete,
}: FolderSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  // 폴더 확장/축소 토글
  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // 재귀적으로 폴더 구조 렌더링
  const renderItems = (items: FileItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        {item.type === "folder" ? (
          // 폴더 렌더링
          <div className="mb-1">
            <div
              className="flex items-center py-1.5 px-2 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => toggleFolder(item.id)}
            >
              {/* 들여쓰기 및 확장/축소 아이콘 */}
              <div style={{ width: `${depth * 16}px` }} />
              {item.children && item.children.length > 0 ? (
                expandedFolders.has(item.id) ? (
                  <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500 mr-1" />
                )
              ) : (
                <div className="w-4 mr-1" />
              )}
              <Folder className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm flex-1 truncate">{item.name}</span>
            </div>

            {/* 확장된 폴더의 자식 아이템들 */}
            {expandedFolders.has(item.id) && item.children && (
              <div className="mt-1">
                {renderItems(item.children, depth + 1)}
              </div>
            )}
          </div>
        ) : (
          // 비디오 파일 렌더링
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                className="flex items-center py-1.5 px-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => onFileSelect?.(item)}
              >
                <div style={{ width: `${depth * 16}px` }} />
                <div className="w-4 mr-1" />
                <Video className="h-4 w-4 text-purple-500 mr-2" />
                <span className="text-sm flex-1 truncate">{item.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onFileSelect?.(item)}>
                      <Play className="h-4 w-4 mr-2" />
                      <span>재생</span>
                    </DropdownMenuItem>
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
                <Play className="h-4 w-4 mr-2" />
                <span>재생</span>
              </ContextMenuItem>
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
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <h2 className="font-medium text-lg">내 폴더</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 pb-6">
          {files.length > 0 ? (
            renderItems(files)
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Folder className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">생성된 영상이 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">
                새로운 영상을 생성해보세요
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
