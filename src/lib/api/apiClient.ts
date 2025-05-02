import axios from 'axios';

// 환경변수에서 BASE_URL 가져오기 (또는 직접 설정)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080/api';

// API 클라이언트 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 모든 요청에 쿠키 포함
  timeout: 90000, // 타임아웃 설정
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // multipart/form-data인 경우 Content-Type 헤더를 자동으로 설정하도록 함
    if (config.data instanceof FormData) {
      if (config.headers) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 에러 처리 로직
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('API 응답 에러:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('API 요청 에러: 서버로부터 응답이 없습니다', {
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      // 요청 설정 중에 에러가 발생한 경우
      console.error('API 설정 에러:', error.message);
    }

    // 401 Unauthorized 에러 처리
    if (error.response?.status === 401) {
      // 로그인 페이지로 리다이렉트 또는 토큰 갱신 로직
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;