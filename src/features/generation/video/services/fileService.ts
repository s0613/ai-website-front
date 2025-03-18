// services/fileService.ts
import { FileItem } from "@/types/fileTypes";
import { mapFolderData, mapFileData } from "@/utils/fileUtils";

export async function fetchFoldersAPI(): Promise<FileItem[]> {
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
      `폴더 목록 조회 실패: ${response.status} ${responseText || response.statusText}`
    );
  }
  const data = responseText.trim() ? JSON.parse(responseText) : [];
  return mapFolderData(data);
}

export async function fetchFolderFilesAPI(folderId: string): Promise<FileItem[]> {
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
  const data = responseText.trim() ? JSON.parse(responseText) : [];
  return mapFileData(data);
}
