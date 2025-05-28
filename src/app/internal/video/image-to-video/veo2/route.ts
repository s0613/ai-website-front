/* …생략: import, validation 등 기존 코드 … */

import { NextResponse } from "next/server";
import { addVideoJob, getJobStatus } from '@/app/internal/video/services/VideoQueueService';

type AspectRatio = "auto" | "auto_prefer_portrait" | "16:9" | "9:16";
type Duration = "5s" | "6s" | "7s" | "8s";

interface Veo2Request {
    prompt: string;
    imageUrl: string;
    aspect_ratio?: AspectRatio;
    duration?: Duration;
    userId: string;
    notificationId?: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as Veo2Request;
        console.log('[VEO2 POST] 요청 바디:', JSON.stringify(body));

        const {
            prompt,
            imageUrl,
            aspect_ratio = "auto",
            duration = "5s",
            userId,
            notificationId
        } = body;

        // 필수 파라미터 검증
        const missing: string[] = [];
        if (!prompt) missing.push('prompt');
        if (!imageUrl) missing.push('imageUrl');
        if (!userId) missing.push('userId');

        if (missing.length > 0) {
            console.warn('[VEO2 POST] 필수 파라미터 누락:', missing);
            return NextResponse.json(
                { error: '필수 파라미터 누락', missing },
                { status: 400 }
            );
        }

        // aspect_ratio 유효성 검증
        const validAspectRatios: AspectRatio[] = ["auto", "auto_prefer_portrait", "16:9", "9:16"];
        if (!validAspectRatios.includes(aspect_ratio)) {
            console.warn('[VEO2 POST] 잘못된 aspect_ratio:', aspect_ratio);
            return NextResponse.json(
                { error: `잘못된 aspect_ratio: ${aspect_ratio}. 가능한 값: ${validAspectRatios.join(', ')}` },
                { status: 400 }
            );
        }

        // duration 유효성 검증
        const validDurations: Duration[] = ["5s", "6s", "7s", "8s"];
        if (!validDurations.includes(duration)) {
            console.warn('[VEO2 POST] 잘못된 duration:', duration);
            return NextResponse.json(
                { error: `잘못된 duration: ${duration}. 가능한 값: ${validDurations.join(', ')}` },
                { status: 400 }
            );
        }

        console.log('[VEO2 POST] 큐에 작업 추가 시도 →', { prompt, imageUrl, userId, aspect_ratio, duration, notificationId });

        // 작업을 큐에 추가
        const jobId = await addVideoJob('veo2', {
            type: 'veo2',
            prompt,
            imageUrl,
            aspect_ratio,
            duration,
            userId,
            notificationId
        });

        console.log('[VEO2 POST] 큐에 작업 추가 완료. jobId=', jobId);

        return NextResponse.json({
            jobId,
            status: 'queued'
        }, { status: 202 });

    } catch (error: unknown) {
        console.error('[VEO2 POST] 오류 발생:', error);
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
        console.log('[VEO2 GET] 조회 요청 jobId=', jobId);

        if (!jobId) {
            console.warn('[VEO2 GET] jobId가 없습니다');
            return NextResponse.json({ error: 'jobId required' }, { status: 400 });
        }

        const status = await getJobStatus(jobId);
        console.log('[VEO2 GET] 상태 조회 결과 →', status);
        return NextResponse.json(status, { status: 200 });
    } catch (error: unknown) {
        console.error('[VEO2 GET] 오류 발생:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
