import apiClient from '@/lib/api/apiClient';
import { ProfileResponse } from '@/features/my/types/Filter';

// 프로필 설정 관련 API 서비스
export const settingService = {
  /**
   * 사용자 닉네임 변경
   * @param nickname 변경할 새로운 닉네임
   * @returns ProfileResponse 객체
   */
  updateNickname: async (nickname: string): Promise<ProfileResponse> => {
    try {
      const response = await apiClient.put<ProfileResponse>('/profile/nickname', { nickname });
      return response.data;
    } catch (error) {
      // 에러 처리
      console.error('닉네임 변경 실패:', error);
      return {
        success: false,
        message: '닉네임 변경에 실패했습니다.'
      };
    }
  }
}