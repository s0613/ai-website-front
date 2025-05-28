import { NextRequest, NextResponse } from "next/server";
import { addVideoJob, getJobStatus } from '@/app/internal/video/services/VideoQueueService';

type AspectRatio = "16:9" | "9:16";
type Resolution = "720p";
type NumFrames = 129;

interface HunyuanRequest {
    prompt: string;
    imageUrl: string;
    seed?: number;
    aspect_ratio?: AspectRatio;
    resolution?: Resolution;
    num_frames?: NumFrames;
    i2v_stability?: boolean;
    userId: string;
    notificationId?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as HunyuanRequest;
        console.log('[HUNYUAN POST] 요청 바디:', JSON.stringify(body));

        const {
            prompt,
            imageUrl,
            seed,
            aspect_ratio = "16:9",
            resolution = "720p",
            num_frames = 129,
            i2v_stability = false,
            userId,
            notificationId
        } = body;

        // 필수 파라미터 검증
        const missing: string[] = [];
        if (!prompt) missing.push('prompt');
        if (!imageUrl) missing.push('imageUrl');
        if (!userId) missing.push('userId');

        if (missing.length > 0) {
            console.warn('[HUNYUAN POST] 필수 파라미터 누락:', missing);
            return NextResponse.json(
                { error: '필수 파라미터 누락', missing },
                { status: 400 }
            );
        }

        // aspect_ratio 유효성 검증
        const validAspectRatios: AspectRatio[] = ["16:9", "9:16"];
        if (!validAspectRatios.includes(aspect_ratio)) {
            console.warn('[HUNYUAN POST] 잘못된 aspect_ratio:', aspect_ratio);
            return NextResponse.json(
                { error: `잘못된 aspect_ratio: ${aspect_ratio}. 가능한 값: ${validAspectRatios.join(', ')}` },
                { status: 400 }
            );
        }

        // resolution 유효성 검증 (현재는 720p만 지원)
        if (resolution !== "720p") {
            console.warn('[HUNYUAN POST] 잘못된 resolution:', resolution);
            return NextResponse.json(
                { error: `잘못된 resolution: ${resolution}. 현재 720p만 지원됩니다.` },
                { status: 400 }
            );
        }

        // num_frames 유효성 검증 (현재는 129만 지원)
        if (num_frames !== 129) {
            console.warn('[HUNYUAN POST] 잘못된 num_frames:', num_frames);
            return NextResponse.json(
                { error: `잘못된 num_frames: ${num_frames}. 현재 129만 지원됩니다.` },
                { status: 400 }
            );
        }

        console.log('[HUNYUAN POST] 큐에 작업 추가 시도 →', {
            prompt,
            imageUrl,
            userId,
            seed,
            aspect_ratio,
            resolution,
            num_frames,
            i2v_stability,
            notificationId
        });

        // 작업을 큐에 추가
        const jobId = await addVideoJob('hunyuan', {
            type: 'hunyuan',
            prompt,
            imageUrl,
            seed,
            aspect_ratio,
            resolution,
            num_frames,
            i2v_stability,
            userId,
            notificationId
        });

        console.log('[HUNYUAN POST] 큐에 작업 추가 완료. jobId=', jobId);

        return NextResponse.json({
            jobId,
            status: 'queued'
        }, { status: 202 });

    } catch (error: unknown) {
        console.error('[HUNYUAN POST] 오류 발생:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const jobId = new URL(req.url).searchParams.get('jobId');
        console.log('[HUNYUAN GET] 조회 요청 jobId=', jobId);

        if (!jobId) {
            console.warn('[HUNYUAN GET] jobId가 없습니다');
            return NextResponse.json({ error: 'jobId required' }, { status: 400 });
        }

        const status = await getJobStatus(jobId);
        console.log('[HUNYUAN GET] 상태 조회 결과 →', status);
        return NextResponse.json(status, { status: 200 });
    } catch (error: unknown) {
        console.error('[HUNYUAN GET] 오류 발생:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
} 