// 이미지 타입 정의 - 백엔드 모델에 맞게 수정
// 기존 ImageItem 타입 정의를 확장하세요
export interface ImageItem {
  id: number;
  name: string;
  fileName: string; // 기존 속성
  prompt: string;
  category?: string; // 기존 속성
  url: string;
  thumbnailUrl: string;
  format: string;
  fileSize?: number; // 기존 속성
  sizeInBytes: number;
  width?: number; // 기존 속성
  height?: number; // 기존 속성
  status: string;
  lastModified?: string; // 기존 속성
  createdAt: string; // 새로 추가
  creator: string; // 새로 추가
  model?: string;
  liked: boolean; // 새로 추가
  likeCount: number; // 새로 추가
  aspectRatio: number; // 새로 추가
}

// 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}