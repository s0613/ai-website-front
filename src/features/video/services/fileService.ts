// services/fileService.ts
import { FileItem, FileResponse } from "../types/fileTypes";
import { mapFolderData, mapFileData } from "../videoGeneration/utils/fileUtils";
import apiClient from "@/lib/api/apiClient";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp"
];

function isImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase());
}

export async function fetchFoldersAPI(): Promise<FileItem[]> {
  try {
    const { data } = await apiClient.get("/my/folder");
    return mapFolderData(data);
  } catch (error) {
    throw new Error("폴더 목록 조회에 실패했습니다.");
  }
}

export async function fetchFolderFilesAPI(folderId: string): Promise<FileItem[]> {
  try {
    const { data } = await apiClient.get(`/files/folder/${folderId}`);
    return mapFileData(data);
  } catch (error) {
    throw new Error("파일 목록 조회에 실패했습니다.");
  }
}

export async function uploadImageAPI(image: File): Promise<FileResponse> {
  try {
    // 이미지 파일 검증
    if (!isImageFile(image)) {
      throw new Error("지원하지 않는 이미지 형식입니다. (지원 형식: JPG, PNG, GIF, BMP, WEBP)");
    }

    const formData = new FormData();
    formData.append("image", image);

    const { data } = await apiClient.post<FileResponse>("/files/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("이미지 업로드에 실패했습니다.");
  }
}

export async function uploadFileAPI(file: File, folderId: string): Promise<FileResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<FileResponse>(`/files/upload/${folderId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    throw new Error("파일 업로드에 실패했습니다.");
  }
}
