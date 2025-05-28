// src/app/internal/video/image-to-video/kling/route.ts

import { NextResponse } from 'next/server';
import { addVideoJob, getJobStatus } from '@/app/internal/video/services/VideoQueueService';

interface KlingRequest {
    prompt: string;
    imageUrl: string;
    duration?: string;
    aspect_ratio?: string;
    camera_control?: string;
    notificationId?: string;
    userId: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as KlingRequest;
        // console.log('[Kling POST] 요청 바디:', JSON.stringify(body));

        const {
            prompt,
            imageUrl,
            duration,
            aspect_ratio,
            camera_control,
            notificationId,
            userId
        } = body;

        const missing: string[] = [];
        if (!prompt) missing.push('prompt');
        if (!imageUrl) missing.push('imageUrl');
        if (!userId) missing.push('userId');

        if (missing.length) {
            console.warn('[Kling POST] 필수 파라미터 누락:', missing);
            return NextResponse.json(
                { error: '필수 파라미터 누락', missing },
                { status: 400 }
            );
        }

        // console.log('[Kling POST] 큐에 작업 추가 시도 →', { prompt, imageUrl, userId, duration, aspect_ratio, camera_control, notificationId });
        const jobId = await addVideoJob('kling', {
            type: 'kling',
            prompt,
            imageUrl,
            userId,
            duration,
            aspect_ratio,
            camera_control,
            notificationId
        });
        // console.log('[Kling POST] 큐에 작업 추가 완료. jobId=', jobId);

        return NextResponse.json(
            { jobId, status: 'queued' },
            { status: 202 }
        );
    } catch (error: unknown) {
        console.error('[Kling POST] 오류 발생:', error);
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
        console.log('[Kling GET] 조회 요청 jobId=', jobId);
        if (!jobId) {
            console.warn('[Kling GET] jobId가 없습니다');
            return NextResponse.json({ error: 'jobId required' }, { status: 400 });
        }

        const status = await getJobStatus(jobId);
        console.log('[Kling GET] 상태 조회 결과 →', status);
        return NextResponse.json(status, { status: 200 });
    } catch (error: unknown) {
        console.error('[Kling GET] 오류 발생:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
