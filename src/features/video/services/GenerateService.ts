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
  endpoint: string; // 이 필드는 'model'로 대체될 수 있습니다. 백엔드와 협의 필요.
  model: string; // 새로 추가된 필드: 사용된 모델 정보
  videoName: string;
  imageFile?: File | null;
  videoUrl: string;  // 필수 필드로 변경
  referenceUrl?: string; // 참조 이미지 URL (선택적)
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
      model: data.model,
      videoUrl: data.videoUrl,
      mode: data.imageFile ? 'IMAGE' : 'TEXT',
      referenceUrl: data.referenceUrl,
    };

    console.log('[비디오 저장 요청]', {
      endpoint: data.endpoint,
      model: data.model,
      videoName: data.videoName,
      mode: data.imageFile ? 'IMAGE' : 'TEXT',
      videoUrl: data.videoUrl.substring(0, 50) + '...',
      referenceUrl: data.referenceUrl,
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
    const formData = new FormData();

    // VideoCreateRequest에 필요한 메타데이터 객체
    // data.model 값을 videoMetadata.model에 할당합니다.
    // 백엔드 AIVideoRequest는 'model' 필드를 사용합니다.
    const videoMetadata: VideoCreateRequest = {
      videoName: data.videoName,
      prompt: data.prompt,
      model: data.model, // VideoSaveRequest에서 전달된 model 값을 사용
      endpoint: data.endpoint, // endpoint 값도 유지 (프론트엔드 다른 로직에서 사용될 수 있음)
      videoUrl: data.videoUrl,
      mode: data.imageFile ? 'IMAGE' : 'TEXT',
      referenceUrl: data.referenceUrl,
    };

    formData.append('data', new Blob([JSON.stringify(videoMetadata)], { type: 'application/json' }));

    if (data.imageFile) {
      formData.append('referenceFile', data.imageFile);
    }

    console.log('[URL 비디오 저장 요청]', {
      endpoint: '/my/videos/url',
      videoName: videoMetadata.videoName,
      model: videoMetadata.model,
      mode: videoMetadata.mode,
      videoUrl: videoMetadata.videoUrl.substring(0, 50) + '...',
      referenceFile: data.imageFile ? data.imageFile.name : 'none',
      referenceUrl: data.referenceUrl,
    });

    const apiResponse = await apiClient.post<VideoDto>('/my/videos/url', formData, {
      // FormData 사용 시 Content-Type은 브라우저가 자동으로 설정 (multipart/form-data)
      // headers: {
      //   'Content-Type': 'multipart/form-data', // 명시적으로 설정할 필요 없음
      // },
    });

    console.log('[URL 비디오 저장 성공]', {
      id: apiResponse.data.id,
      name: apiResponse.data.name,
      creator: apiResponse.data.creator
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
 * 선택된 엔드포인트와 활성 탭에 따라 알맞은 API URL을 반환하는 함수
 * @param endpoint 선택한 모델 엔드포인트 (예: "veo2", "kling", "wan", "hunyuan", "upscaler")
 * @param activeTab 현재 활성화된 탭 ("image", "text", "video")
 * @returns API 엔드포인트 URL
 */
export function getVideoEndpointUrl(
  endpoint: string,
  activeTab: "image" | "text" | "video"
): string {
  // 1) veo2 모델은 이미지 변환과 텍스트 변환을 구분 처리
  if (endpoint === "veo2") {
    if (activeTab === "image") {
      return "/api/video/image-to-video/veo2";
    } else {
      // "text" 또는 "video" 탭인 경우 텍스트→비디오 엔드포인트 사용
      return "/api/video/text-to-video/veo2";
    }
  }

  // 2) 그 외 모델들은 모두 이미지→비디오 변환용
  const urlMap: Record<string, string> = {
    kling: "/api/video/image-to-video/kling",
    wan: "/api/video/image-to-video/wan",
    hunyuan: "/api/video/image-to-video/hunyuan",
    upscaler: "/api/video/upscaler",
  };

  // 3) 매핑된 URL이 없으면 기본값(veo2 이미지 변환) 반환
  return urlMap[endpoint] ?? "/api/video/image-to-video/veo2";
}

