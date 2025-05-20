/**
 * 비디오 저장 서비스
 * FAL.ai에서 생성된 비디오를 Spring Boot 서버에 저장하는 서비스
 */

import apiClient from '@/lib/api/apiClient';
import type { VideoSaveRequest } from '@/app/internal/video/types/VideoSaveRequest';
import type { VideoSaveResponse } from '@/app/internal/video/types/VideoSaveResponse';

export class VideoStorageService {
    /**
     * 비디오 저장
     * 생성된 비디오를 Spring Boot 서버에 저장합니다.
     */
    static async saveVideo(videoData: VideoSaveRequest): Promise<VideoSaveResponse> {
        try {
            console.log(`[VideoStorageService] 비디오 저장 요청 - 모델: ${videoData.model}`);

            const { data } = await apiClient.post<VideoSaveResponse>('/video/save', videoData);

            console.log(`[VideoStorageService] 비디오 저장 성공 - ID: ${data.id}`);

            return data;
        } catch (error) {
            console.error('[VideoStorageService] 비디오 저장 오류:', error);
            throw error;
        }
    }
} 