import { ImageItem, ApiResponse } from '../types/Image';
import apiClient from '@/lib/api/apiClient';


/**
 * 모든 이미지 목록을 가져오는 함수
 * @returns 이미지 목록
 */
export const getImages = async (): Promise<ImageItem[]> => {
  try {
    const response = await apiClient.get<ImageItem[]>('/images');
    return response.data;
  } catch (error) {
    console.error('이미지 목록을 가져오는데 실패했습니다:', error);
    throw error;
  }
};

/**
 * 카테고리별 이미지 목록을 가져오는 함수
 * @param category 이미지 카테고리
 * @returns 필터링된 이미지 목록
 */
export const getImagesByCategory = async (category: string): Promise<ImageItem[]> => {
  try {
    const response = await apiClient.get<ImageItem[]>(`/images?category=${category}`);
    return response.data;
  } catch (error) {
    console.error(`카테고리 ${category}의 이미지를 가져오는데 실패했습니다:`, error);
    throw error;
  }
};

/**
 * 여러 이미지를 업로드하는 함수
 * @param files 업로드할 파일 목록
 * @param category 이미지 카테고리
 * @returns 업로드 결과
 */
export const uploadImages = async (files: File[], category: string): Promise<ApiResponse<ImageItem[]>> => {
  const formData = new FormData();
  
  // 파일 추가
  files.forEach(file => {
    formData.append('images', file);
  });
  
  // 카테고리 추가
  formData.append('category', category);
  
  const response = await apiClient.post<ApiResponse<ImageItem[]>>('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

/**
 * 이미지를 삭제하는 함수
 * @param imageId 삭제할 이미지 ID
 * @returns 삭제 결과
 */
export const deleteImage = async (imageId: number): Promise<ApiResponse<void>> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error(`이미지 ID ${imageId} 삭제에 실패했습니다:`, error);
    throw error;
  }
};