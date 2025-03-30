import apiClient from '@/lib/api/apiClient';
import { AxiosResponse } from 'axios';
import { Folder, FolderItem, CreateFolderRequest, AddItemRequest } from '../types/Folder';

/**
 * 폴더 목록 조회
 * @returns 폴더 배열
 */
export const getFolders = async (): Promise<Folder[]> => {
  try {
    // 백엔드 직접 호출: /api/folders (GET)
    const response: AxiosResponse<Folder[]> = await apiClient.get<Folder[]>('/folders');
    return response.data;
  } catch (error) {
    console.error('폴더 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 폴더 생성
 * @param name 생성할 폴더 이름
 * @returns 생성된 폴더 정보
 */
export const createFolder = async (name: string): Promise<Folder> => {
  try {
    const request: CreateFolderRequest = { name };
    // 백엔드 직접 호출: /api/folders (POST)
    const response: AxiosResponse<Folder> = await apiClient.post<Folder>('/folders', request);
    return response.data;
  } catch (error) {
    console.error('폴더 생성 실패:', error);
    throw error;
  }
};

/**
 * 폴더 삭제
 * @param id 삭제할 폴더 ID
 */
export const deleteFolder = async (id: number): Promise<void> => {
  try {
    // 백엔드 직접 호출: /api/folders/{id} (DELETE)
    await apiClient.delete(`/folders/${id}`);
  } catch (error) {
    console.error('폴더 삭제 실패:', error);
    throw error;
  }
};

/**
 * 특정 폴더 조회
 * @param id 조회할 폴더 ID
 * @returns 폴더 정보
 */
export const getFolder = async (id: number): Promise<Folder> => {
  try {
    // 백엔드 직접 호출: /api/folders/{id} (GET)
    const response: AxiosResponse<Folder> = await apiClient.get<Folder>(`/folders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`폴더 ID ${id} 조회 실패:`, error);
    throw error;
  }
};

/**
 * 폴더 이름 수정
 * @param id 수정할 폴더 ID
 * @param name 새 폴더 이름
 * @returns 수정된 폴더 정보
 */
export const updateFolder = async (id: number, name: string): Promise<Folder> => {
  try {
    // 백엔드 직접 호출: /api/folders/{id} (PATCH)
    const response: AxiosResponse<Folder> = await apiClient.patch<Folder>(`/folders/${id}`, { name });
    return response.data;
  } catch (error) {
    console.error(`폴더 ID ${id} 수정 실패:`, error);
    throw error;
  }
};

/**
 * 폴더에 아이템 추가
 * @param folderId 폴더 ID
 * @param itemId 추가할 아이템 ID
 * @param itemType 아이템 타입 (예: 'image', 'video')
 */
export const addItemToFolder = async (
  folderId: number, 
  itemId: number, 
  itemType: string
): Promise<void> => {
  try {
    const request: AddItemRequest = { itemId, itemType };
    // 백엔드 직접 호출: /api/folders/{folderId}/items (POST)
    await apiClient.post(`/folders/${folderId}/items`, request);
  } catch (error) {
    console.error(`폴더 ${folderId}에 아이템 추가 실패:`, error);
    throw error;
  }
};

/**
 * 폴더에서 아이템 제거
 * @param folderId 폴더 ID
 * @param itemId 제거할 아이템 ID
 */
export const removeItemFromFolder = async (folderId: number, itemId: number): Promise<void> => {
  try {
    // 백엔드 직접 호출: /api/folders/{folderId}/items/{itemId} (DELETE)
    await apiClient.delete(`/folders/${folderId}/items/${itemId}`);
  } catch (error) {
    console.error(`폴더 ${folderId}에서 아이템 ${itemId} 제거 실패:`, error);
    throw error;
  }
};

/**
 * 폴더 내 아이템 목록 조회
 * @param id 폴더 ID
 * @returns 폴더 내 아이템 배열
 */
export const getFolderItems = async (id: number): Promise<FolderItem[]> => {
  try {
    // 백엔드 직접 호출: /api/files/folder/{id} (GET)
    // Next.js 라우트에서는 /api/files/folder/{id}를 사용하므로 이를 따름
    const response: AxiosResponse<FolderItem[]> = await apiClient.get<FolderItem[]>(`/files/folder/${id}`);
    return response.data;
  } catch (error) {
    console.error(`폴더 ID ${id}의 아이템 목록 조회 실패:`, error);
    throw error;
  }
};

/**
 * 파일 업로드
 * @param folderId 폴더 ID
 * @param file 업로드할 파일
 * @returns 업로드된 파일 정보
 */
export const uploadFile = async (folderId: number, file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // 백엔드 직접 호출: /api/files/upload/{folderId} (POST)
    // Content-Type은 axios가 자동으로 multipart/form-data로 설정
    const response = await apiClient.post(`/files/upload/${folderId}`, formData, {
      headers: {
        // multipart/form-data 헤더는 axios가 자동으로 boundary를 설정하므로 직접 지정하지 않음
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`파일 업로드 실패 (폴더 ID: ${folderId}):`, error);
    throw error;
  }
};

/**
 * 파일 다운로드 URL 가져오기
 * @param fileId 파일 ID
 * @returns 다운로드 URL
 */
export const getFileDownloadUrl = (fileUrl: string): string => {
  // URL이 이미 완전한 형태인지 확인
  if (fileUrl.startsWith('http')) {
    return fileUrl;
  }
  
  // 상대 경로인 경우 baseURL과 결합
  const baseURL = apiClient.defaults.baseURL?.replace(/\/api$/, '') || '';
  return `${baseURL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
};