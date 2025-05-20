import Redis from 'ioredis';

// Redis 클라이언트 싱글톤 인스턴스
let redisClient: Redis | null = null;

// 비디오 상태 관리를 위한 Hash 키
const VIDEO_HASH_KEY = 'videos:status';
const VIDEO_META_HASH_KEY = 'videos:metadata';
const FAL_REQUEST_MAP_KEY = 'videos:fal_requests';

export async function getRedisClient(): Promise<Redis> {
    if (!redisClient) {
        console.log(`[Redis] 연결 시도: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);

        try {
            redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

            redisClient.on('connect', () => {
                console.log('[Redis] 연결 성공 ✅');
            });

            redisClient.on('ready', () => {
                console.log('[Redis] 서버 준비 완료 ✅');
            });

            redisClient.on('error', (err) => {
                console.error('[Redis] 연결 오류 ❌:', err);
            });

            redisClient.on('close', () => {
                console.log('[Redis] 연결 종료 🔌');
            });

            redisClient.on('reconnecting', () => {
                console.log('[Redis] 재연결 시도 중... 🔄');
            });
        } catch (error) {
            console.error('[Redis] 클라이언트 초기화 실패:', error);
            throw error;
        }
    }

    return redisClient;
}

// 비디오 상태 관리 함수 (Hash 패턴 사용)
export interface VideoStatus {
    requestId: string;           // 내부 요청 ID
    falRequestId?: string;       // FAL API 요청 ID
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: Record<string, unknown>; // 비디오 결과 데이터
    error?: string;              // 오류 메시지
    notificationId?: number;     // 연관된 알림 ID
    updatedAt: string;           // 마지막 업데이트 시간
}

// 비디오 요청 상태 저장 (Hash 사용)
export async function saveVideoStatus(status: VideoStatus): Promise<void> {
    const redis = await getRedisClient();
    const { requestId } = status;

    console.log(`[Redis] Hash에 상태 저장 중 💾: ${requestId}, 상태: ${status.status}`);

    try {
        // 상태 정보를 JSON으로 직렬화하여 저장
        await redis.hset(VIDEO_HASH_KEY, requestId, JSON.stringify(status));

        // FAL requestId와 내부 requestId의 매핑 저장 (있는 경우)
        if (status.falRequestId) {
            await redis.hset(FAL_REQUEST_MAP_KEY, status.falRequestId, requestId);
        }

        console.log(`[Redis] Hash 저장 성공 ✅: ${requestId}`);
    } catch (error) {
        console.error(`[Redis] Hash 저장 실패 ❌: ${requestId}`, error);
        throw error;
    }
}

// 비디오 상태 조회 (Hash 사용)
export async function getVideoStatus(requestId: string): Promise<VideoStatus | null> {
    const redis = await getRedisClient();
    console.log(`[Redis] Hash에서 상태 조회 중 🔍: ${requestId}`);

    try {
        const result = await redis.hget(VIDEO_HASH_KEY, requestId);

        if (!result) {
            console.log(`[Redis] Hash에서 상태 없음 ⚠️: ${requestId}`);
            return null;
        }

        console.log(`[Redis] Hash에서 상태 조회 성공 ✅: ${requestId}`);
        return JSON.parse(result) as VideoStatus;
    } catch (error) {
        console.error(`[Redis] Hash 조회 실패 ❌: ${requestId}`, error);
        throw error;
    }
}

// FAL requestId로 내부 requestId 조회
export async function getInternalRequestId(falRequestId: string): Promise<string | null> {
    const redis = await getRedisClient();
    console.log(`[Redis] FAL requestId 매핑 조회 중 🔍: ${falRequestId}`);

    try {
        const requestId = await redis.hget(FAL_REQUEST_MAP_KEY, falRequestId);

        if (!requestId) {
            console.log(`[Redis] FAL requestId 매핑 없음 ⚠️: ${falRequestId}`);
            return null;
        }

        console.log(`[Redis] FAL requestId 매핑 조회 성공 ✅: ${falRequestId} -> ${requestId}`);
        return requestId;
    } catch (error) {
        console.error(`[Redis] FAL requestId 매핑 조회 실패 ❌: ${falRequestId}`, error);
        throw error;
    }
}

// 추가 메타데이터 저장 (옵션)
export async function saveVideoMetadata(requestId: string, metadata: Record<string, unknown>): Promise<void> {
    const redis = await getRedisClient();
    console.log(`[Redis] 메타데이터 저장 중 💾: ${requestId}`);

    try {
        await redis.hset(VIDEO_META_HASH_KEY, requestId, JSON.stringify(metadata));
        console.log(`[Redis] 메타데이터 저장 성공 ✅: ${requestId}`);
    } catch (error) {
        console.error(`[Redis] 메타데이터 저장 실패 ❌: ${requestId}`, error);
        throw error;
    }
}

// 애플리케이션 종료 시 Redis 연결 닫기
if (process.env.NODE_ENV !== 'production') {
    try {
        process.on('SIGTERM', () => {
            if (redisClient) {
                redisClient.quit();
            }
        });
    } catch (error) {
        console.error('[Redis] 이벤트 리스너 등록 실패:', error);
    }
} 