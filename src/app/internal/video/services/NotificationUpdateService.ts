import apiClient from '@/lib/api/apiClient';

/**
 * 비디오 생성 알림 업데이트 서비스
 * 
 * 이 서비스는 내부 API에서 비디오 생성 프로세스의 상태를 업데이트할 때 사용됩니다.
 * 
 * 사용 예시:
 * 
 * // 1. 비디오 생성 처리 시작
 * await NotificationUpdateService.updateToProcessing(
 *     notificationId,
 *     userId,
 *     thumbnailUrl,  // 선택적
 *     mediaCount     // 선택적
 * );
 * 
 * // 2. 비디오 생성 완료 (videoId 포함)
 * await NotificationUpdateService.updateToCompleted(
 *     notificationId,
 *     userId,
 *     videoId,       // 생성된 비디오 ID (필수)
 *     thumbnailUrl,  // 선택적
 *     mediaCount     // 선택적
 * );
 * 
 * // 3. 비디오 생성 실패
 * await NotificationUpdateService.updateToFailed(
 *     notificationId,
 *     userId,
 *     "생성 중 오류가 발생했습니다"
 * );
 * 
 * 주의사항:
 * - INTERNAL_API_TOKEN 환경변수가 설정되어 있어야 합니다
 * - userId는 백엔드 요구사항에 따라 필수입니다
 * - videoId는 완료 상태에서만 포함되며, 알림 클릭 시 영상 상세 보기에 사용됩니다
 */

/* ------------------------------------------------------------------
 * 타입 정의
 * ------------------------------------------------------------------ */
export type GenerationStatus =
    | 'REQUESTED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED';

/** 상태 업데이트 바디 */
export interface GenerationNotificationUpdateRequest {
    status: GenerationStatus;
    /** 변경된 썸네일 URL(선택) */
    thumbnailUrl?: string;
    /** 변경된 이미지·영상 개수(선택) */
    mediaCount?: number;
    /** 생성된 비디오 ID (선택) */
    videoId?: number;
    /** 실패 시 오류 메시지 (선택) */
    errorMessage?: string;
    /** 사용자 ID */
    userId: string;
}

/** 단건 응답 */
export interface GenerationNotificationResponse {
    id: number;
    title: string;
    thumbnailUrl: string;
    mediaCount: number;
    status: GenerationStatus;
    updatedAt: string; // ISO‑8601 문자열
    /** 생성된 비디오 ID (성공 시) */
    videoId?: number;
    /** 실패 시 오류 메시지 */
    errorMessage?: string;
}

/* ------------------------------------------------------------------
 * 서비스 클래스
 * ------------------------------------------------------------------ */
export class NotificationUpdateService {
    /** 백엔드 컨트롤러 base path */
    private static readonly BASE_PATH = '/notifications';

    /**
     * 상태/썸네일/개수 업데이트
     */
    static async updateNotification(
        id: number,
        request: GenerationNotificationUpdateRequest,
    ): Promise<GenerationNotificationResponse> {
        const internalToken = process.env.INTERNAL_API_TOKEN!;

        try {
            console.log(`[NotificationUpdateService] 알림 업데이트 요청:`, {
                id,
                request,
                url: `${this.BASE_PATH}/${id}`,
                hasInternalToken: !!internalToken,
                tokenLength: internalToken ? internalToken.length : 0
            });

            const { data } = await apiClient.put<GenerationNotificationResponse>(
                `${this.BASE_PATH}/${id}`,
                {
                    ...request,
                    userId: request.userId,
                },
                {
                    headers: {
                        'X-API-TOKEN': internalToken,
                    },
                }
            );


            return data;
        } catch (error: unknown) {
            console.error(`[NotificationUpdateService] 알림 업데이트 실패:`, {
                id,
                request,
                error
            });

            const err = error as { response?: { status?: number, data?: unknown } };
            if (err.response?.status === 401) {
                throw new Error('인증이 필요합니다. 내부 토큰을 확인해주세요.');
            }

            // 더 자세한 에러 정보 출력
            const responseData = err.response?.data as { message?: string } | undefined;
            const errorMessage = responseData?.message || (typeof err.response?.data === 'string' ? err.response.data : '알림 상태 업데이트에 실패했습니다.');
            throw new Error(errorMessage);
        }
    }

    /**
     * 비디오 생성 처리 시작 알림
     */
    static async updateToProcessing(
        notificationId: number,
        userId: string,
        thumbnailUrl?: string,
        mediaCount?: number
    ): Promise<GenerationNotificationResponse> {
        console.log(`[NotificationUpdateService] 처리 시작 알림 업데이트:`, {
            notificationId,
            userId,
            thumbnailUrl,
            mediaCount
        });

        return this.updateNotification(notificationId, {
            status: 'PROCESSING',
            userId,
            thumbnailUrl,
            mediaCount,
        });
    }

    /**
     * 비디오 생성 완료 알림 (videoId 포함)
     */
    static async updateToCompleted(
        notificationId: number,
        userId: string,
        videoId: number,
        thumbnailUrl?: string,
        mediaCount?: number
    ): Promise<GenerationNotificationResponse> {
        console.log(`[NotificationUpdateService] 완료 알림 업데이트:`, {
            notificationId,
            userId,
            videoId,
            thumbnailUrl,
            mediaCount
        });

        return this.updateNotification(notificationId, {
            status: 'COMPLETED',
            userId,
            videoId,
            thumbnailUrl,
            mediaCount,
        });
    }

    /**
     * 비디오 생성 실패 알림
     */
    static async updateToFailed(
        notificationId: number,
        userId: string,
        errorMessage: string
    ): Promise<GenerationNotificationResponse> {
        console.log(`[NotificationUpdateService] 실패 알림 업데이트:`, {
            notificationId,
            userId,
            errorMessage
        });

        return this.updateNotification(notificationId, {
            status: 'FAILED',
            userId,
            errorMessage,
        });
    }
}
