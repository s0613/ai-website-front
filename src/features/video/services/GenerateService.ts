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

// 비디오 생성 요청 타입
export interface VideoGenerationRequest {
  prompt: string;
  imageUrl?: string;
  aspectRatio?: string;
  duration?: string;
  quality?: string;
  style?: string;
  resolution?: string;
  upscaling?: boolean;
  seed?: number;
  cameraControl?: string;
  numFrames?: number;
  framesPerSecond?: number;
  numInferenceSteps?: number;
}

// 비디오 생성 응답 타입
export interface VideoGenerationResponse {
  videoUrl: string;
  requestId?: string;
}

/**
 * 비디오 생성 함수
 * @param data 비디오 생성에 필요한 데이터
 * @param endpointUrl 사용할 엔드포인트 URL
 */
export const generateVideo = async (
  data: VideoGenerationRequest,
  endpointUrl: string
): Promise<VideoGenerationResponse> => {
  try {
    interface ApiResponse {
      videoUrl: string;
      requestId?: string;
    }
    
    const response = await apiClient.post<ApiResponse>(endpointUrl, data);
    
    if (!response.data.videoUrl) {
      throw new Error('비디오 URL을 받지 못했습니다');
    }
    
    return {
      videoUrl: response.data.videoUrl,
      requestId: response.data.requestId
    };
  } catch (error) {
    console.error('비디오 생성 오류:', error);
    throw error;
  }
};

// 비디오 저장 요청 타입
export interface VideoSaveRequest {
  prompt: string;
  endpoint: string;
  videoName?: string;
  imageFile?: File | null; // imageFile 속성 추가
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
    // 비디오 URL로부터 비디오 파일 가져오기
    const videoResponse = await fetch(videoUrl);
    const videoBlob = await videoResponse.blob();
    const videoFile = new File(
      [videoBlob], 
      `${data.videoName || 'generated-video'}.mp4`, 
      { type: 'video/mp4' }
    );

    // 참조 이미지가 있는 경우 처리
    let referenceFile: File | undefined = undefined;
    if (data.imageFile) {
      referenceFile = data.imageFile;
    }

    // VideoCreateRequest 객체 생성
    const videoData: VideoCreateRequest = {
      videoName: data.videoName || `AI 생성 영상 - ${new Date().toLocaleString()}`,
      prompt: data.prompt,
      endpoint: data.endpoint
    };

    // MyVideoService의 saveVideo 함수 호출을 위해 필요한 객체 구성
    const response = await apiClient.post<VideoDto>('/my/videos', {
      data: videoData,
      videoFile,
      referenceFile
    }, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('비디오 저장 오류:', error);
    throw error;
  }
};

// 업스케일링 응답 타입
export interface UpscaleVideoResponse {
  data?: {
    video_upscaled?: string;
    [key: string]: any;
  };
  message?: string;
  status?: string;
}

/**
 * 비디오 업스케일링 함수
 * @param videoUrl 업스케일할 비디오 URL
 */
export const upscaleVideo = async (videoUrl: string): Promise<UpscaleVideoResponse> => {
  try {
    const response = await apiClient.post<UpscaleVideoResponse>('/video/upscaler', {
      videoUrl
    });
    
    return response.data;
  } catch (error) {
    console.error('비디오 업스케일링 오류:', error);
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
      return "/api/video/veo2";
    case "luna":
      // Luna는 이미지/텍스트 모드에 따라 다른 엔드포인트 사용
      return hasImage ? "/api/video/luna/image" : "/api/video/luna/text";
    case "kling":
      return "/api/video/kling";
    case "wan":
      return "/api/video/wan";
    case "hunyuan":
      return "/api/video/hunyuan";
    case "upscaler":
      return "/api/video/upscaler";
    default:
      // 기본값은 Luna의 텍스트 모드로 설정
      return "/api/video/luna/text";
  }
}
