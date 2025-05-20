import Queue from 'bull';
import { getRedisClient } from './redis';
import { FalQueueStatus } from './falTypes';

// 비디오 생성 요청 타입
export interface VideoRequestData {
    requestId: string;         // 요청 ID
    apiProvider: string;       // API 제공자 (예: 'fal-ai/veo2/image-to-video')
    params: Record<string, unknown>;  // API 호출에 필요한 파라미터
    userId?: string;           // 요청한 사용자 ID (인증된 경우)
    createdAt: Date;           // 요청 생성 시간
    notificationId?: number;   // 연관된 알림 ID (선택)
}

// 비디오 처리 결과 타입
export interface VideoProcessResult {
    requestId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: Record<string, unknown>;
    error?: string;
    updatedAt: Date;
    notificationId?: number;  // 연관된 알림 ID (선택)
}

// 비디오 처리 큐 설정
export const videoProcessQueue = new Queue<VideoRequestData>('video-processing', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
    },
    defaultJobOptions: {
        attempts: 3,             // 최대 재시도 횟수
        backoff: {
            type: 'exponential',   // 지수적 백오프
            delay: 1000            // 기본 지연 시간 (1초)
        },
        removeOnComplete: 100,   // 완료된 작업 중 100개만 보관
        removeOnFail: 100        // 실패한 작업 중 100개만 보관
    }
});

// 비디오 처리 큐 이벤트 리스너 추가
videoProcessQueue.on('error', (error) => {
    console.error('[비디오 처리 큐] 오류 발생 ❌:', error);
});

videoProcessQueue.on('waiting', (jobId) => {
    console.log(`[비디오 처리 큐] 작업 대기 중 ⏳: ${jobId}`);
});

videoProcessQueue.on('active', (job) => {
    console.log(`[비디오 처리 큐] 작업 시작 🚀: ${job.id}, requestId: ${job.data.requestId}`);
});

videoProcessQueue.on('stalled', (job) => {
    console.warn(`[비디오 처리 큐] 작업 지연 ⚠️: ${job.id}, requestId: ${job.data.requestId}`);
});

videoProcessQueue.on('progress', (job, progress) => {
    console.log(`[비디오 처리 큐] 작업 진행 중 📊: ${job.id}, 진행률: ${progress}%, requestId: ${job.data.requestId}`);
});

// 상태 확인 큐 데이터 타입
export interface VideoStatusCheckData {
    requestId: string;
    apiProvider: string;
    falRequestId: string;     // FAL API 요청 ID 추가
    pollCount?: number;
}

// 상태 확인 큐 설정
export const videoStatusQueue = new Queue<VideoStatusCheckData>('video-status-check', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
    },
    defaultJobOptions: {
        repeat: {
            every: 10000,         // 10초마다 실행
        },
        removeOnComplete: false  // 완료 후에도 작업 유지
    }
});

// 상태 확인 큐 이벤트 리스너 추가
videoStatusQueue.on('error', (error) => {
    console.error('[상태 확인 큐] 오류 발생 ❌:', error);
});

videoStatusQueue.on('waiting', (jobId) => {
    console.log(`[상태 확인 큐] 작업 대기 중 ⏳: ${jobId}`);
});

videoStatusQueue.on('active', (job) => {
    console.log(`[상태 확인 큐] 상태 확인 시작 🔍: ${job.id}, requestId: ${job.data.requestId}`);
});

videoStatusQueue.on('stalled', (job) => {
    console.warn(`[상태 확인 큐] 작업 지연 ⚠️: ${job.id}, requestId: ${job.data.requestId}`);
});

// 비디오 처리 결과를 Redis에 저장하는 유틸리티 함수
export async function saveVideoProcessResult(result: VideoProcessResult): Promise<void> {
    const redis = await getRedisClient();
    const key = `video:result:${result.requestId}`;
    console.log(`[Redis] 결과 저장 중 💾: ${key}, 상태: ${result.status}`);

    try {
        await redis.set(key, JSON.stringify(result));
        // 결과는 24시간 동안만 유지
        await redis.expire(key, 60 * 60 * 24);
        console.log(`[Redis] 결과 저장 성공 ✅: ${key}, 만료시간: 24시간`);
    } catch (error) {
        console.error(`[Redis] 결과 저장 실패 ❌: ${key}`, error);
        throw error;
    }
}

// 비디오 처리 결과를 Redis에서 가져오는 유틸리티 함수
export async function getVideoProcessResult(requestId: string): Promise<VideoProcessResult | null> {
    const redis = await getRedisClient();
    const key = `video:result:${requestId}`;
    console.log(`[Redis] 결과 조회 중 🔍: ${key}`);

    try {
        const result = await redis.get(key);

        if (!result) {
            console.log(`[Redis] 결과 없음 ⚠️: ${key}`);
            return null;
        }

        console.log(`[Redis] 결과 조회 성공 ✅: ${key}`);
        return JSON.parse(result) as VideoProcessResult;
    } catch (error) {
        console.error(`[Redis] 결과 조회 실패 ❌: ${key}`, error);
        throw error;
    }
} 