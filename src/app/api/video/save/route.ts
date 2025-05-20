/**
 * 비디오 저장 API 라우트
 * Internal 서비스에서 완료된 비디오를 Spring Boot 서버로 저장하는 중개 역할
 */
import { VideoSaveRequest } from '@/app/internal/video/types/VideoSaveRequest';
import { VideoSaveResponse } from '@/app/internal/video/types/VideoSaveResponse';
import apiClient from '@/lib/api/apiClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // 요청 바디 파싱
        const requestData: VideoSaveRequest = await req.json();

        // 필수 필드 검증
        if (!requestData.prompt || !requestData.videoUrl || !requestData.model) {
            return NextResponse.json(
                { error: '필수 필드가 누락되었습니다: prompt, videoUrl, model' },
                { status: 400 }
            );
        }

        console.log('[API 라우트] 비디오 저장 요청:', {
            model: requestData.model,
            videoName: requestData.videoName
        });

        // VideoCreateRequest 형식으로 변환
        const videoRequest = {
            videoName: requestData.videoName || `AI 생성 영상 - ${new Date().toLocaleTimeString()}`,
            prompt: requestData.prompt,
            endpoint: requestData.endpoint,
            model: requestData.model,
            videoUrl: requestData.videoUrl,
            mode: requestData.activeTab === 'text' ? 'TEXT' : 'IMAGE',
            referenceUrl: requestData.referenceUrl,
            falRequestId: requestData.falRequestId,
            requestId: requestData.requestId,
        };

        // apiClient를 사용하여 직접 백엔드 API 호출
        const { data } = await apiClient.post('/my/videos', videoRequest);

        // 응답 데이터 구성
        const responseData: VideoSaveResponse = {
            id: data.id || 0,
            success: true,
            videoUrl: data.url || requestData.videoUrl,
            thumbnailUrl: data.thumbnailUrl || '',
            createdAt: data.createdAt || new Date().toISOString(),
            message: '비디오가 성공적으로 저장되었습니다'
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('[API 라우트] 비디오 저장 오류:', error);

        // 오류 응답 처리 개선
        const errorMessage = error instanceof Error ? error.message : '비디오 저장 중 오류가 발생했습니다';
        const statusCode = error.response?.status || 500;

        return NextResponse.json(
            {
                error: errorMessage,
                success: false
            },
            { status: statusCode }
        );
    }
} 