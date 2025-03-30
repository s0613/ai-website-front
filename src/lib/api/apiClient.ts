import axios from 'axios';

// 환경변수에서 BASE_URL 가져오기 (또는 직접 설정)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080/api';

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 모든 요청에 쿠키 포함
});

// 인터셉터 설정 등 필요한 경우 여기에 추가
apiClient.interceptors.request.use(
  (config) => {
    // 요청 전송 전 처리 (예: 토큰 추가)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 에러 처리 로직
    return Promise.reject(error);
  }
);

export default apiClient;