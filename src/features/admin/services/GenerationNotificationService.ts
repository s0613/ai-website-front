// src/lib/api/GenerationNotificationService.ts
import apiClient from '@/lib/api/apiClient';

/* ------------------------------------------------------------------
 * 타입 정의
 * ------------------------------------------------------------------ */
export type GenerationStatus =
    | 'REQUESTED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED';

/** 생성(요청) 바디 */
export interface GenerationNotificationCreateRequest {
    /** 예: "골프장에서 매력 뽐내기" */
    title: string;
    /** 최초 썸네일 URL(선택) */
    thumbnailUrl?: string;
    /** 예상 이미지·영상 개수(선택) */
    mediaCount?: number;
}

/** 상태 업데이트 바디 */
export interface GenerationNotificationUpdateRequest {
    status: GenerationStatus;
    /** 변경된 썸네일 URL(선택) */
    thumbnailUrl?: string;
    /** 변경된 이미지·영상 개수(선택) */
    mediaCount?: number;
}

/** 단건 응답 */
export interface GenerationNotificationResponse {
    id: number;
    title: string;
    thumbnailUrl: string;
    mediaCount: number;
    status: GenerationStatus;
    updatedAt: string; // ISO‑8601 문자열
}

/** 목록 응답 */
export interface GenerationNotificationListResponse {
    notifications: GenerationNotificationResponse[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

/* ------------------------------------------------------------------
 * 서비스 클래스
 * ------------------------------------------------------------------ */
export class GenerationNotificationService {
    /** 백엔드 컨트롤러 base path */
    private static readonly BASE_PATH = '/notifications';

    /**
     * ① 생성(요청) 알림 등록
     */
    static async createNotification(
        request: GenerationNotificationCreateRequest,
    ): Promise<GenerationNotificationResponse> {
        try {
            const { data } = await apiClient.post<GenerationNotificationResponse>(
                this.BASE_PATH,
                request,
            );
            return data;
        } catch {
            throw new Error('생성 요청 알림 등록에 실패했습니다.');
        }
    }

    /**
     * ② 상태/썸네일/개수 업데이트
     */
    static async updateNotification(
        id: number,
        request: GenerationNotificationUpdateRequest,
    ): Promise<GenerationNotificationResponse> {
        try {
            const { data } = await apiClient.put<GenerationNotificationResponse>(
                `${this.BASE_PATH}/${id}`,
                request,
            );
            return data;
        } catch {
            throw new Error('알림 상태 업데이트에 실패했습니다.');
        }
    }

    /**
     * ③ 내 알림(요청 목록) 조회
     */
    static async getNotifications(
        page: number = 0,
        size: number = 10,
    ): Promise<GenerationNotificationListResponse> {
        try {
            const { data } = await apiClient.get<GenerationNotificationListResponse>(
                this.BASE_PATH,
                { params: { page, size } },
            );
            return data;
        } catch {
            throw new Error('알림 목록 조회에 실패했습니다.');
        }
    }
}

export * from '@/features/admin/services/GenerationNotificationService';
