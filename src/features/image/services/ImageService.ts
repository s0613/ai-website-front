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
 * Fashn 폴더에 이미지를 업로드하는 함수
 * @param imageUrl 업로드할 이미지 URL
 * @returns 업로드된 파일 정보
 */
export const uploadFashnImage = async (imageUrl: string): Promise<ApiResponse<ImageItem>> => {
  try {
    const uploadResponse = await apiClient.post<ApiResponse<ImageItem>>(
      '/files/upload/fashn',
      { imageUrl } // 🔑 문자열이 아닌, 이렇게 객체 형태로 요청 바디에 넣어야 합니다.
    );
    return uploadResponse.data;
  } catch (error) {
    console.error('Fashn 이미지 업로드에 실패했습니다:', error);
    throw error;
  }
};

/**
 * Upscaler 폴더에 이미지를 업로드하는 함수
 * @param imageUrl 업로드할 이미지 URL
 * @returns 업로드된 파일 정보
 */
export const uploadUpscalerImage = async (imageUrl: string): Promise<ApiResponse<ImageItem>> => {
  try {
    const uploadResponse = await apiClient.post<ApiResponse<ImageItem>>(
      '/files/upload/upscaler',
      { imageUrl }
    );
    return uploadResponse.data;
  } catch (error) {
    console.error('Upscaler 이미지 업로드에 실패했습니다:', error);
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
    const response = await apiClient.delete<ApiResponse<void>>(`/images/${imageId}`);
    return response.data;
  } catch (error) {
    console.error(`이미지 ID ${imageId} 삭제에 실패했습니다:`, error);
    throw error;
  }
};

export async function downloadImage(imageUrl: string, fileName: string) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('이미지 다운로드에 실패했습니다.');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}