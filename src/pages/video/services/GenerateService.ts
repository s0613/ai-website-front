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
}

/**
 * 생성된 비디오를 서버에 저장하는 함수
 * @param videoUrl 비디오 URL
 * @param data 비디오 메타데이터
 */
export const saveVideo = async (
  videoUrl: string,
  data: VideoSaveRequest
): Promise<VideoDto> => {
  try {
    const formData = new FormData();

    // videoUrl을 Blob으로 변환하여 videoFile로 추가
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    formData.append('videoFile', blob, 'video.mp4');

    // 메타데이터 추가
    const videoData: VideoCreateRequest = {
      videoName: data.videoName,
      prompt: data.prompt,
      endpoint: data.endpoint
    };
    formData.append('data', JSON.stringify(videoData));

    // 참조 이미지가 있는 경우 추가
    if (data.imageFile) {
      formData.append('referenceFile', data.imageFile);
    }

    const apiResponse = await apiClient.post<VideoDto>('/my/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return apiResponse.data;
  } catch (error) {
    console.error('비디오 저장 오류:', error);
    if (error && typeof error === 'object' && 'response' in error && error.response) {
      const response = error.response as { data?: string; status?: number };
      if (response.status === 500) {
        if (response.data?.includes('videoFile')) {
          throw new Error('비디오 파일 업로드에 실패했습니다. 파일이 올바른 형식인지 확인해주세요.');
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
 * @param hasImage 이미지 파일이나 URL이 있는지 여부
 * @returns API 엔드포인트 URL
 */
export function getVideoEndpointUrl(endpoint: string, hasImage: boolean): string {
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
