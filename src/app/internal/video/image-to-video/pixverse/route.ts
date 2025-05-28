import { NextResponse } from 'next/server';
import { addVideoJob, getJobStatus } from '@/app/internal/video/services/VideoQueueService';

interface PixverseRequest {
    prompt: string;
    imageUrl: string;
    aspect_ratio?: '16:9' | '4:3' | '1:1' | '3:4' | '9:16';
    resolution?: '360p' | '540p' | '720p' | '1080p';
    duration?: '5' | '8';
    negative_prompt?: string;
    style?: 'anime' | '3d_animation' | 'clay' | 'comic' | 'cyberpunk';
    seed?: number;
    notificationId?: string;
    userId: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as PixverseRequest;
        console.log('[Pixverse POST] 요청 바디:', JSON.stringify(body));

        const {
            prompt,
            imageUrl,
            aspect_ratio,
            resolution,
            duration,
            negative_prompt,
            style,
            seed,
            notificationId,
            userId
        } = body;

        const missing: string[] = [];
        if (!prompt) missing.push('prompt');
        if (!imageUrl) missing.push('imageUrl');
        if (!userId) missing.push('userId');

        if (missing.length) {
            console.warn('[Pixverse POST] 필수 파라미터 누락:', missing);
            return NextResponse.json(
                { error: '필수 파라미터 누락', missing },
                { status: 400 }
            );
        }

        // duration 유효성 검증
        if (duration && !['5', '8'].includes(duration)) {
            console.warn('[Pixverse POST] 잘못된 duration:', duration);
            return NextResponse.json(
                { error: `잘못된 duration: ${duration}. 5 또는 8만 지원됩니다.` },
                { status: 400 }
            );
        }

        // aspect_ratio 유효성 검증
        if (aspect_ratio && !['16:9', '4:3', '1:1', '3:4', '9:16'].includes(aspect_ratio)) {
            console.warn('[Pixverse POST] 잘못된 aspect_ratio:', aspect_ratio);
            return NextResponse.json(
                { error: `잘못된 aspect_ratio: ${aspect_ratio}. 16:9, 4:3, 1:1, 3:4, 9:16만 지원됩니다.` },
                { status: 400 }
            );
        }

        // resolution 유효성 검증
        if (resolution && !['360p', '540p', '720p', '1080p'].includes(resolution)) {
            console.warn('[Pixverse POST] 잘못된 resolution:', resolution);
            return NextResponse.json(
                { error: `잘못된 resolution: ${resolution}. 360p, 540p, 720p, 1080p만 지원됩니다.` },
                { status: 400 }
            );
        }

        // style 유효성 검증
        if (style && !['anime', '3d_animation', 'clay', 'comic', 'cyberpunk'].includes(style)) {
            console.warn('[Pixverse POST] 잘못된 style:', style);
            return NextResponse.json(
                { error: `잘못된 style: ${style}. anime, 3d_animation, clay, comic, cyberpunk만 지원됩니다.` },
                { status: 400 }
            );
        }

        console.log('[Pixverse POST] 큐에 작업 추가 시도 →', {
            prompt,
            imageUrl,
            userId,
            aspect_ratio,
            resolution,
            duration,
            negative_prompt,
            style,
            seed,
            notificationId
        });

        const jobId = await addVideoJob('pixverse', {
            type: 'pixverse',
            prompt,
            imageUrl,
            userId,
            aspect_ratio,
            resolution,
            duration,
            negative_prompt,
            style,
            seed,
            notificationId
        });

        console.log('[Pixverse POST] 큐에 작업 추가 완료. jobId=', jobId);

        return NextResponse.json(
            { jobId, status: 'queued' },
            { status: 202 }
        );
    } catch (error: unknown) {
        console.error('[Pixverse POST] 오류 발생:', error);
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
        console.log('[Pixverse GET] 조회 요청 jobId=', jobId);
        if (!jobId) {
            console.warn('[Pixverse GET] jobId가 없습니다');
            return NextResponse.json({ error: 'jobId required' }, { status: 400 });
        }

        const status = await getJobStatus(jobId);
        console.log('[Pixverse GET] 상태 조회 결과 →', status);
        return NextResponse.json(status, { status: 200 });
    } catch (error: unknown) {
        console.error('[Pixverse GET] 오류 발생:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
