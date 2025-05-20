import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 서버 사이드 모듈 동적 로드 함수
async function getServerModules() {
    try {
        const queueModule = await import('@/app/internal/utils/videoQueue');
        return {
            videoProcessQueue: queueModule.videoProcessQueue,
            getVideoProcessResult: queueModule.getVideoProcessResult
        };
    } catch (error) {
        console.error('서버 모듈 로드 실패:', error);
    }

    // 모듈 로드 실패 시 기본값
    return {
        videoProcessQueue: null,
        getVideoProcessResult: null
    };
}

// Edge 환경에서 직접 Redis 사용을 피하기 위해 Node.js 런타임으로 전환
// export const runtime = 'edge';

// 서버 런타임 명시적 설정
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const startTime = new Date();
    console.log(`[API 요청] 📹 이미지→비디오 요청 시작: ${startTime.toISOString()}`);

    try {
        const body = await req.json();
        const { prompt, image_url, aspect_ratio = 'auto', duration = '5s', notificationId } = body;

        console.log(`[API 요청] 📋 요청 파라미터:`, JSON.stringify({
            prompt_length: prompt?.length || 0,
            image_url: image_url ? `${image_url.substring(0, 30)}...` : null, // URL 전체를 로깅하지 않음
            aspect_ratio,
            duration,
            notificationId: notificationId || 'none'
        }, null, 2));

        // 필수 파라미터 검증
        if (!prompt || !image_url) {
            console.warn(`[API 요청] ⚠️ 필수 파라미터 누락: prompt=${!!prompt}, image_url=${!!image_url}`);
            return NextResponse.json(
                { error: 'Prompt와 image_url은 필수 값입니다' },
                { status: 400 }
            );
        }

        // 요청 ID 생성
        const requestId = uuidv4();
        console.log(`[API 요청] 🆔 요청 ID 생성: ${requestId}`);

        try {
            // 서버 모듈 동적 로드
            const { videoProcessQueue } = await getServerModules();

            if (!videoProcessQueue) {
                throw new Error('서버 모듈 로드 실패');
            }

            // 비디오 처리 큐에 작업 추가
            console.log(`[API 요청] 🔄 작업 큐에 추가 중: ${requestId}`);
            await videoProcessQueue.add({
                requestId,
                apiProvider: 'fal-ai/veo2/image-to-video',
                params: {
                    prompt,
                    image_url,
                    aspect_ratio,
                    duration,
                },
                createdAt: new Date(),
                notificationId: notificationId ? parseInt(notificationId, 10) : undefined
            }, {
                jobId: requestId,
                removeOnComplete: false
            });
            console.log(`[API 요청] ✅ 작업 큐 추가 성공: ${requestId}`);
        } catch (queueError) {
            // Redis/Queue 오류 처리
            console.error(`[API 요청] 🔴 큐 작업 추가 실패: ${requestId}`);
            console.error(queueError);

            // Edge 환경 또는 Redis 연결 오류의 경우 fallback 응답
            return NextResponse.json({
                requestId,
                status: 'pending',
                message: '비디오 생성 요청이 접수되었습니다 (큐 오류로 인해 직접 처리 모드)',
                fallback: true,
                timestamp: new Date().toISOString()
            });
        }

        const endTime = new Date();
        const responseTime = (endTime.getTime() - startTime.getTime());
        console.log(`[API 요청] ⏱️ 요청 처리 완료: ${requestId}, 소요시간: ${responseTime}ms`);

        return NextResponse.json({
            requestId,
            status: 'pending',
            message: '비디오 생성 요청이 큐에 추가되었습니다',
            timestamp: endTime.toISOString(),
            responseTime: `${responseTime}ms`
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : '';

        console.error(`[API 요청] 🔴 오류 발생: ${errorMessage}`);
        if (errorStack) {
            console.error(`[API 요청] 🔴 오류 상세: ${errorStack}`);
        }

        const endTime = new Date();
        const responseTime = (endTime.getTime() - startTime.getTime());
        console.error(`[API 요청] ⏱️ 오류 처리 완료, 소요시간: ${responseTime}ms`);

        return NextResponse.json(
            {
                error: '비디오 생성 처리 실패',
                message: errorMessage,
                timestamp: endTime.toISOString(),
                responseTime: `${responseTime}ms`
            },
            { status: 500 }
        );
    }
}

// 비디오 생성 상태 확인 API
export async function GET(req: NextRequest) {
    const startTime = new Date();
    let requestId: string | null = null;

    try {
        const url = new URL(req.url);
        requestId = url.searchParams.get('requestId');
        console.log(`[상태 API] 🔍 상태 확인 요청: ${startTime.toISOString()}, requestId=${requestId || 'null'}`);

        if (!requestId) {
            console.warn(`[상태 API] ⚠️ requestId 누락`);
            return NextResponse.json(
                {
                    error: 'requestId는 필수 파라미터입니다',
                    timestamp: new Date().toISOString()
                },
                { status: 400 }
            );
        }

        try {
            // 서버 모듈 동적 로드
            const { getVideoProcessResult } = await getServerModules();

            if (!getVideoProcessResult) {
                throw new Error('서버 모듈 로드 실패');
            }

            // Redis에서 현재 처리 상태 확인
            console.log(`[상태 API] 🔄 처리 상태 조회 중: ${requestId}`);
            const result = await getVideoProcessResult(requestId);

            if (!result) {
                console.warn(`[상태 API] ⚠️ 요청 정보 없음: ${requestId}`);
                return NextResponse.json(
                    {
                        error: '해당 요청을 찾을 수 없습니다',
                        requestId,
                        timestamp: new Date().toISOString()
                    },
                    { status: 404 }
                );
            }

            const endTime = new Date();
            const responseTime = (endTime.getTime() - startTime.getTime());
            console.log(`[상태 API] ✅ 상태 확인 완료: ${requestId}, 상태: ${result.status}, 소요시간: ${responseTime}ms`);

            return NextResponse.json({
                ...result,
                timestamp: endTime.toISOString(),
                responseTime: `${responseTime}ms`
            });
        } catch (redisError) {
            // Redis 연결 오류 처리
            console.error(`[상태 API] 🔴 Redis 연결 오류: ${requestId}`);
            console.error(redisError);

            // Redis 연결 불가 시 기본 응답
            return NextResponse.json({
                requestId,
                status: 'unknown',
                message: 'Redis 연결 오류로 상태를 조회할 수 없습니다',
                fallback: true,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : '';

        console.error(`[상태 API] 🔴 오류 발생: ${requestId || 'unknown'}, ${errorMessage}`);
        if (errorStack) {
            console.error(`[상태 API] 🔴 오류 상세: ${errorStack}`);
        }

        const endTime = new Date();
        const responseTime = (endTime.getTime() - startTime.getTime());
        console.error(`[상태 API] ⏱️ 오류 처리 완료, 소요시간: ${responseTime}ms`);

        return NextResponse.json(
            {
                error: '비디오 상태 확인 실패',
                message: errorMessage,
                requestId: requestId || undefined,
                timestamp: endTime.toISOString(),
                responseTime: `${responseTime}ms`
            },
            { status: 500 }
        );
    }
}
