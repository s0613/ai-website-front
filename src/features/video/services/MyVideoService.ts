import apiClient from '@/lib/api/apiClient';
import { VideoDto, VideoCreateRequest } from '../types/Video';

/**
 * 특정 ID의 비디오 조회
 * @param id 비디오 ID
 */
export const getVideoById = async (id: number): Promise<VideoDto> => {
  try {
    const response = await apiClient.get<VideoDto>(`/my/videos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`ID ${id}의 비디오를 가져오는데 실패했습니다:`, error);
    throw error;
  }
};

/**
 * 사용자 비디오 목록 조회
 */
export const getUserVideos = async (): Promise<VideoDto[]> => {
  try {
    const response = await apiClient.get<VideoDto[]>('/my/videos/user');
    return response.data;
  } catch (error) {
    console.error('사용자 비디오 목록을 가져오는데 실패했습니다:', error);
    throw error;
  }
};

/**
 * 좋아요한 비디오 목록 조회
 */
export const getLikedVideos = async (): Promise<VideoDto[]> => {
  try {
    const response = await apiClient.get<VideoDto[]>('/videos/like/my');
    return response.data;
  } catch (error) {
    console.error('좋아요한 비디오 목록을 가져오는데 실패했습니다:', error);
    throw error;
  }
};

/**
 * 공유된 비디오 목록 조회 (로그인 필요)
 */
export const getSharedVideos = async (): Promise<VideoDto[]> => {
  try {
    const response = await apiClient.get<VideoDto[]>('/videos/shared');
    return response.data;
  } catch (error) {
    console.error('공유된 비디오 목록을 가져오는데 실패했습니다:', error);
    throw error;
  }
};

/**
 * 공유된 비디오 목록 조회 (로그인 불필요)
 */
export const getSharedVideosNoLogin = async (): Promise<VideoDto[]> => {
  try {
    const response = await apiClient.get<VideoDto[]>('/videos/shared/no-login');
    return response.data;
  } catch (error) {
    console.error('공유된 비디오 목록을 가져오는데 실패했습니다:', error);
    throw error;
  }
};

/**
 * 비디오 타입 기준 조회
 * @param type 비디오 타입 (VIDEO, IMAGE, TEXT)
 */
export const getVideosByType = async (type: string): Promise<VideoDto[]> => {
  try {
    const response = await apiClient.get<VideoDto[]>(`/my/videos/type/${type.toUpperCase()}`);
    return response.data;
  } catch (error) {
    console.error(`타입 ${type}의 비디오를 가져오는데 실패했습니다:`, error);
    throw error;
  }
};

/**
 * 비디오 공유 상태 토글
 * @param id 비디오 ID
 * @param share 공유 상태 (true/false)
 */
export const toggleVideoShare = async (id: number, share: boolean): Promise<VideoDto> => {
  try {
    const response = await apiClient.patch<VideoDto>(`/my/videos/${id}/share?share=${share}`);
    return response.data;
  } catch (error) {
    console.error('비디오 공유 상태 변경에 실패했습니다:', error);
    throw error;
  }
};

/**
 * 비디오 좋아요 상태 업데이트
 * @param id 비디오 ID
 * @param like 좋아요 상태 (true/false)
 */
export const updateVideoLike = async (id: number, like: boolean): Promise<VideoDto> => {
  try {
    const response = await apiClient.patch<VideoDto>(`/videos/like/${id}?like=${like}`);
    return response.data;
  } catch (error) {
    console.error('비디오 좋아요 상태 업데이트에 실패했습니다:', error);
    throw error;
  }
};

/**
 * 비디오 저장
 * @param data 비디오 데이터
 * @param videoFile 비디오 파일
 * @param referenceFile 참조 파일 (선택적)
 */
export const saveVideo = async (
  data: VideoCreateRequest,
  videoFile: File,
  referenceFile?: File
): Promise<VideoDto> => {
  try {
    const formData = new FormData();
    
    // 비디오 파일 추가
    formData.append('videoFile', videoFile);
    
    // 참조 파일이 있는 경우 추가
    if (referenceFile) {
      formData.append('referenceFile', referenceFile);
    }
    
    // 모드 결정
    let mode = 'TEXT';
    if (referenceFile) {
      const fileType = referenceFile.type || '';
      if (fileType.startsWith('image/')) {
        mode = 'IMAGE';
      } else if (fileType.startsWith('video/')) {
        mode = 'VIDEO';
      }
    }
    
    // DTO 생성
    const requestData = {
      videoName: data.videoName,
      prompt: data.prompt,
      model: data.endpoint,
      mode: mode,
    };
    
    // DTO를 FormData에 추가
    formData.append(
      'data',
      new Blob([JSON.stringify(requestData)], { type: 'application/json' })
    );
    
    // API 요청
    const response = await apiClient.post<VideoDto>('/my/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('비디오 저장에 실패했습니다:', error);
    throw error;
  }
};