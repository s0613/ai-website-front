import apiClient from '@/lib/api/apiClient';
import { VideoDto, VideoCreateRequest } from '../types/Video';

/**
 * 파일을 Base64 문자열로 변환
 * @param file 변환할 파일
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('파일 읽기 실패'));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 오류'));
    reader.readAsDataURL(file);
  });
};

// 비디오 저장 요청 타입
export interface VideoSaveRequest {
  prompt: string;
  endpoint: string;
  videoName: string;
  imageFile?: File | null;
  videoUrl: string;  // 필수 필드로 변경
}

/**
 * 생성된 비디오를 서버에 저장하는 함수
 * @param data 비디오 메타데이터 (videoUrl 포함)
 */
export const saveVideo = async (data: VideoSaveRequest): Promise<VideoDto> => {
  try {
    // JSON 형식으로 데이터 전송
    const requestData: VideoCreateRequest = {
      videoName: data.videoName,
      prompt: data.prompt,
      endpoint: data.endpoint,
      videoUrl: data.videoUrl,
      mode: data.imageFile ? 'IMAGE' : 'TEXT'
    };

    console.log('[비디오 저장 요청]', {
      endpoint: data.endpoint,
      videoName: data.videoName,
      mode: data.imageFile ? 'IMAGE' : 'TEXT',
      videoUrl: data.videoUrl.substring(0, 50) + '...' // URL이 너무 길 수 있으므로 앞부분만 표시
    });

    const apiResponse = await apiClient.post<VideoDto>('/my/videos', requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[비디오 저장 성공]', {
      id: apiResponse.data.id,
      name: apiResponse.data.name,
      creator: apiResponse.data.creator
    });

    return apiResponse.data;
  } catch (error) {
    console.error('[비디오 저장 실패]', error);
    if (error && typeof error === 'object' && 'response' in error && error.response) {
      const response = error.response as { data?: string; status?: number };
      if (response.status === 500) {
        throw new Error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
    throw error;
  }
};

/**
 * URL을 통해 비디오를 서버에 저장하는 함수
 * @param data 비디오 메타데이터 (videoUrl 포함)
 */
export const saveVideoFromUrl = async (data: VideoSaveRequest): Promise<VideoDto> => {
  try {
    const videoData: VideoCreateRequest = {
      videoName: data.videoName,
      prompt: data.prompt,
      endpoint: data.endpoint,
      videoUrl: data.videoUrl
    };

    const apiResponse = await apiClient.post<VideoDto>('/my/videos', videoData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return apiResponse.data;
  } catch (error) {
    console.error('URL 비디오 저장 오류:', error);
    if (error && typeof error === 'object' && 'response' in error && error.response) {
      const response = error.response as { data?: string; status?: number };
      if (response.status === 500) {
        if (response.data?.includes('videoUrl')) {
          throw new Error('비디오 URL이 올바르지 않습니다. URL을 확인해주세요.');
        }
        throw new Error('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
    throw error;
  }
};

/**
 * 선택된 엔드포인트와 이미지 유무에 따라 알맞은 API URL을 반환하는 함수
 * @param endpoint 선택한 모델 엔드포인트
 * @returns API 엔드포인트 URL
 */
export function getVideoEndpointUrl(endpoint: string): string {
  // 엔드포인트별 URL 설정
  switch (endpoint) {
    case "veo2":
      return "/api/video/text-to-video/veo2";
    case "kling":
      return "/api/video/image-to-video/kling";
    case "wan":
      return "/api/video/image-to-video/wan";
    case "hunyuan":
      return "/api/video/image-to-video/hunyuan";
    case "upscaler":
      return "/api/video/upscaler";
    default:
      // 기본값은 Veo2로 설정
      return "/api/video/text-to-video/veo2";
  }
}
