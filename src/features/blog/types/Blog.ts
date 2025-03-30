// 블로그 인터페이스 정의
export interface Blog {
  id?: number;
  title: string;
  subtitle: string;
  author: string;
  content: string;
  image?: string;
  date?: string;
}

// 응답 타입 정의
export interface BlogResponse {
  data: Blog | Blog[];
  status: number;
  message?: string;
}