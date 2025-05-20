/**
 * FAL.ai 클라이언트의 타입 정의
 * 공식 문서 기반 타입을 정의합니다.
 */

// 큐 상태 값
export type FalQueueStatus = 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

// 큐 제출 옵션
export interface FalQueueSubmitOptions<T = Record<string, any>> {
    input: T;
}

// 큐 상태 확인 옵션
export interface FalQueueStatusOptions {
    requestId: string;
}

// 큐 결과 옵션
export interface FalQueueResultOptions {
    requestId: string;
}

// 큐 제출 응답
export interface FalQueueSubmitResponse {
    request_id: string;
    status: FalQueueStatus;
    // 기타 응답 필드들
}

// 큐 상태 응답
export interface FalQueueStatusResponse {
    status: FalQueueStatus;
    error?: string;
    logs?: string[];
    // 기타 응답 필드들
}

// 큐 결과 응답
export interface FalQueueResultResponse<T = any> {
    data: T;
    // 기타 응답 필드들
}

// FAL 큐 인터페이스
export interface FalQueue {
    submit<T = Record<string, any>, R = Record<string, any>>(
        modelUrl: string,
        options: FalQueueSubmitOptions<T>
    ): Promise<FalQueueSubmitResponse>;

    status(
        modelUrl: string,
        options: FalQueueStatusOptions
    ): Promise<FalQueueStatusResponse>;

    result<T = any>(
        modelUrl: string,
        options: FalQueueResultOptions
    ): Promise<FalQueueResultResponse<T>>;
} 