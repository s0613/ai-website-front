import apiClient from '../../../lib/api/apiClient';
import { Blog } from '../types/Blog';

/**
 * 블로그 목록을 가져오는 함수
 */
export const getBlogList = async (): Promise<Blog[]> => {
  try {
    const response = await apiClient.get<Blog[]>('/blogs');
    return response.data;
  } catch (error) {
    console.error('블로그 목록을 가져오는데 실패했습니다:', error);
    throw error;
  }
};

/**
 * 특정 ID의 블로그를 가져오는 함수
 * @param id 블로그 ID
 */
export const getBlogById = async (id: string | number): Promise<Blog> => {
  try {
    const response = await apiClient.get<Blog>(`/blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`ID ${id}의 블로그를 가져오는데 실패했습니다:`, error);
    throw error;
  }
};

/**
 * 새 블로그 생성하는 함수
 * @param blog 블로그 데이터
 * @param imageFile 이미지 파일 (선택사항)
 */
export const createBlog = async (blog: Blog, imageFile?: File): Promise<Blog> => {
  try {
    // FormData 객체 생성
    const formData = new FormData();
    
    // blog 객체를 JSON 문자열로 변환하여 Blob으로 추가
    formData.append('blog', new Blob([JSON.stringify({
      title: blog.title,
      subtitle: blog.subtitle,
      author: blog.author,
      content: blog.content
    })], { type: 'application/json' }));
    
    // 이미지 추가
    if (imageFile) {
      formData.append('image', imageFile);
    }

    // apiClient 사용하여 요청
    const response = await apiClient.post<Blog>('/blogs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('블로그 생성에 실패했습니다:', error);
    throw error;
  }
};