import { NextResponse } from "next/server";
import { addVideoJob, getJobStatus } from '@/app/internal/video/services/VideoQueueService';

interface WanRequest {
    prompt: string;
    imageUrl: string;
    seed?: number;
    enableSafetyChecker?: boolean;
    userId: string;
    notificationId?: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as WanRequest;
        console.log('[WAN POST] 요청 바디:', JSON.stringify(body));

        const {
            prompt,
            imageUrl,
            seed,
            enableSafetyChecker = true,
            userId,
            notificationId
        } = body;

        // 필수 파라미터 검증
        const missing: string[] = [];
        if (!prompt) missing.push('prompt');
        if (!imageUrl) missing.push('imageUrl');
        if (!userId) missing.push('userId');

        if (missing.length > 0) {
            console.warn('[WAN POST] 필수 파라미터 누락:', missing);
            return NextResponse.json(
                { error: '필수 파라미터 누락', missing },
                { status: 400 }
            );
        }

        console.log('[WAN POST] 큐에 작업 추가 시도 →', { prompt, imageUrl, userId, seed, enableSafetyChecker, notificationId });

        // 작업을 큐에 추가
        const jobId = await addVideoJob('wan', {
            type: 'wan',
            prompt,
            imageUrl,
            seed,
            enableSafetyChecker,
            userId,
            notificationId
        });

        console.log('[WAN POST] 큐에 작업 추가 완료. jobId=', jobId);

        return NextResponse.json({
            jobId,
            status: 'queued'
        }, { status: 202 });

    } catch (error: unknown) {
        console.error('[WAN POST] 오류 발생:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const jobId = new URL(req.url).searchParams.get('jobId');
        console.log('[WAN GET] 조회 요청 jobId=', jobId);

        if (!jobId) {
            console.warn('[WAN GET] jobId가 없습니다');
            return NextResponse.json({ error: 'jobId required' }, { status: 400 });
        }

        const status = await getJobStatus(jobId);
        console.log('[WAN GET] 상태 조회 결과 →', status);
        return NextResponse.json(status, { status: 200 });
    } catch (error: unknown) {
        console.error('[WAN GET] 오류 발생:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
} 