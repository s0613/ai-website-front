// 이미지 타입 정의 - 백엔드 모델에 맞게 수정
export interface ImageItem {
  id?: number;            // ID (옵션)
  url: string;            // 이미지 URL
  category: string;       // 카테고리
  fileName: string;       // 이미지 파일 이름
  fileSize?: number;       // 파일 크기 (바이트)
  lastModified?: string;   // 마지막 수정 날짜
  width?: number;          // 이미지 가로 크기
  height?: number;         // 이미지 세로 크기
}

// 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}