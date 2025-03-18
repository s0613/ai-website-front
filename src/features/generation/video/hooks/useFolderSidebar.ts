// hooks/useFolderSidebar.ts
import { useState, useEffect } from "react";
import { FileItem } from "@/types/fileTypes";
import { toast } from "react-hot-toast";

export function useFolderSidebar() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("myFolder");

  // 폴더 목록 조회
  const fetchFolders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/my/folder", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(
          `폴더 목록 조회 실패: ${response.status} ${
            responseText || response.statusText
          }`
        );
      }

      let data = [];
      if (responseText.trim()) {
        data = JSON.parse(responseText);
      }

      const formattedData: FileItem[] = Array.isArray(data)
        ? data.map((folder) => ({
            id: folder.id?.toString() || `folder-${Math.random()}`,
            name: folder.name || "이름 없는 폴더",
            type: "folder",
            created: new Date(folder.createdAt || Date.now()),
            children: Array.isArray(folder.files)
              ? folder.files.map((file) => {
                  const fileName = file.fileName || file.name || "이름 없는 파일";
                  const fileExt = fileName.split(".").pop()?.toLowerCase() || "";
                  const fileType = ["mp4", "mov", "avi", "wmv", "webm"].includes(
                    fileExt
                  )
                    ? "video"
                    : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
                        fileExt
                      )
                    ? "image"
                    : "video";

                  return {
                    id: file.id?.toString() || `file-${Math.random()}`,
                    name: fileName,
                    type: fileType,
                    fileUrl: file.fileUrl,
                    created: new Date(file.createdAt || Date.now()),
                  };
                })
              : [],
          }))
        : [];

      setFiles(formattedData);
    } catch (error) {
      console.error("폴더 로딩 오류:", error);
      setError(error instanceof Error ? error.message : String(error));
      toast.error("폴더 목록을 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 폴더의 파일 목록 조회
  const fetchFolderFiles = async (folderId: string) => {
    const folder = files.find((f) => f.id === folderId);
    if (folder && folder.children && folder.children.length > 0) {
      return;
    }
    setLoadingFolders((prev) => new Set(prev).add(folderId));

    try {
      const response = await fetch(`/api/files/folder/${folderId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`파일 목록 조회 실패: ${response.status}`);
      }

      let folderFiles = [];
      if (responseText.trim()) {
        folderFiles = JSON.parse(responseText);
      }

      const fileItems = Array.isArray(folderFiles)
        ? folderFiles.map((file) => {
            const fileName = file.fileName || file.name || "이름 없는 파일";
            const fileExt = fileName.split(".").pop()?.toLowerCase() || "";
            const fileType = ["mp4", "mov", "avi", "wmv", "webm"].includes(
              fileExt
            )
              ? "video"
              : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExt)
              ? "image"
              : "video";

            return {
              id: file.id?.toString() || `file-${Math.random()}`,
              name: fileName,
              type: fileType as "video" | "image",
              fileUrl: file.fileUrl,
              created: new Date(file.createdAt || Date.now()),
            };
          })
        : [];

      setFiles((prevFiles) =>
        prevFiles.map((folder) =>
          folder.id === folderId ? { ...folder, children: fileItems } : folder
        )
      );
    } catch (error) {
      console.error(`폴더 ID: ${folderId} 파일 목록 로딩 오류:`, error);
      toast.error("파일 목록을 불러오는데 실패했습니다");
    } finally {
      setLoadingFolders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(folderId);
        return newSet;
      });
    }
  };

  // 폴더 확장/축소
  const toggleFolder = async (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
      await fetchFolderFiles(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  return {
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
    fetchFolderFiles,
    toggleFolder,
  };
}
