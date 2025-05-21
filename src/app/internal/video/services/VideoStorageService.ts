import apiClient from '@/lib/api/apiClient';

// 비디오 저장 요청 타입
export interface VideoSaveRequest {
    prompt: string;
    endpoint: string;
    model: string;
    videoName: string;
    imageFile?: File | null;
    videoUrl: string;
    referenceUrl?: string;
    activeTab?: 'image' | 'text' | 'video';
    userId: string; // 필수 필드로 변경
}

// 비디오 저장 응답 타입
export interface VideoSaveResponse {
    id: number;
    name: string;
    url: string;
    createdAt: string;
}

/**
 * URL을 통해 비디오를 서버에 저장하는 함수
 * @param request 비디오 메타데이터 (videoUrl 포함)
 */
export async function saveVideoFromUrl(
    request: VideoSaveRequest
): Promise<VideoSaveResponse> {
    const maxRetries = 3;
    let retryCount = 0;

    // .env에 설정한 INTERNAL_API_TOKEN을 사용
    const internalToken = process.env.INTERNAL_API_TOKEN;

    while (retryCount < maxRetries) {
        try {
            console.log(
                '[URL 비디오 저장 요청] 시도',
                retryCount + 1,
                '/',
                maxRetries,
                {
                    endpoint: '/my/videos/url',
                    videoName: request.videoName,
                    model: request.model,
                    mode: request.activeTab === 'text' ? 'TEXT' : 'IMAGE',
                }
            );

            const requestBody = {
                prompt: request.prompt,
                endpoint: request.endpoint,
                model: request.model,
                videoName: request.videoName,
                videoUrl: request.videoUrl,
                mode: request.activeTab === 'text' ? 'TEXT' : 'IMAGE',
                referenceUrl: request.referenceUrl,
                userId: request.userId, // 항상 포함
            };

            const response = await apiClient.post<VideoSaveResponse>(
                '/my/videos/url',
                requestBody,
                {
                    headers: {
                        // Spring Boot에서 검증할 내부 서비스 토큰
                        'X-API-TOKEN': internalToken, // 헤더 이름 수정
                    },
                }
            );

            console.log('[URL 비디오 저장 성공]', {
                videoId: response.data.id,
                videoName: response.data.name,
            });

            return response.data;
        } catch (error: unknown) {
            retryCount++;
            console.error(
                `[URL 비디오 저장 오류] 시도 ${retryCount}/${maxRetries}:`,
                error
            );

            const axiosError = error as { response?: { status?: number } };

            // 401 에러는 재시도하지 않고 즉시 중단
            if (axiosError.response?.status === 401) {
                console.error('[URL 비디오 저장 실패] 인증이 필요합니다.');
                throw new Error('인증이 필요합니다. 내부 토큰을 확인해주세요.');
            }

            // 마지막 시도에서도 실패한 경우
            if (retryCount === maxRetries) {
                console.error('[URL 비디오 저장 최종 실패]');
                throw new Error(
                    '비디오 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'
                );
            }

            // 재시도 전 대기 (누적 지연)
            await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        }
    }

    throw new Error('비디오 저장에 실패했습니다.');
}
