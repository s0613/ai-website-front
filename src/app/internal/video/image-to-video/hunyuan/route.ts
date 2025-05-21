import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { saveVideoFromUrl } from '@/app/internal/video/services/VideoStorageService';

if (!process.env.FAL_KEY) {
    throw new Error("Missing FAL_KEY environment variable");
}

fal.config({
    credentials: process.env.FAL_KEY,
});

export const runtime = 'edge';

interface HunyuanRequest {
    prompt: string;
    image_url: string;
    seed?: number;
    aspect_ratio?: "16:9" | "9:16";
    resolution?: "512p" | "720p";
    num_frames?: number;
    i2v_stability?: boolean;
    negative_prompt?: string;
    num_inference_steps?: number;
    fps?: number;
    cfg_scale?: number;
    enable_prompt_expansion?: boolean;
    enable_safety_checker?: boolean;
    userId: string;
    notificationId?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as HunyuanRequest;
        const {
            prompt,
            image_url,
            seed,
            aspect_ratio = "16:9",
            resolution = "720p",
            num_frames = 129,
            i2v_stability = false,
            negative_prompt,
            num_inference_steps = 30,
            fps = 25,
            cfg_scale = 7.5,
            enable_prompt_expansion = true,
            enable_safety_checker = true,
            userId,
            notificationId
        } = body;

        // 필수 파라미터 검증
        const missingParams = [];
        if (!prompt) missingParams.push('prompt');
        if (!image_url) missingParams.push('image_url');
        if (!userId) missingParams.push('userId');

        if (missingParams.length > 0) {
            console.error('[Hunyuan] 필수 파라미터 누락:', missingParams);
            return NextResponse.json(
                {
                    error: "필수 파라미터가 누락되었습니다.",
                    missingParams
                },
                { status: 400 }
            );
        }

        // API 호출 전 로깅
        console.log("[Hunyuan] API 호출 시작:", {
            prompt,
            image_url,
            seed,
            aspect_ratio,
            resolution,
            num_frames,
            i2v_stability,
            negative_prompt,
            num_inference_steps,
            fps,
            cfg_scale,
            enable_prompt_expansion,
            enable_safety_checker,
            notificationId
        });

        // Hunyuan API 호출
        const result = await fal.subscribe("fal-ai/hunyuan-video-image-to-video", {
            input: {
                prompt,
                image_url,
                seed,
                aspect_ratio,
                resolution,
                num_frames,
                i2v_stability,
                negative_prompt,
                num_inference_steps,
                fps,
                cfg_scale,
                enable_prompt_expansion,
                enable_safety_checker
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log('[Hunyuan] 처리 중:', update.logs.map((log) => log.message));
                }
            },
        });

        console.log('[Hunyuan] 영상 생성 완료:', {
            requestId: result.requestId,
            videoUrl: result.data?.video?.url
        });

        // 비디오 생성이 완료되면 스프링부트 서버에 저장
        if (result.data?.video?.url) {
            try {
                console.log('[Hunyuan] 스프링부트 저장 요청 시작');
                const savedVideo = await saveVideoFromUrl({
                    prompt,
                    endpoint: 'hunyuan',
                    model: 'hunyuan-video-image-to-video',
                    videoName: `Hunyuan Video - ${new Date().toISOString()}`,
                    videoUrl: result.data.video.url,
                    referenceUrl: image_url,
                    activeTab: 'image',
                    userId: userId,
                });
                console.log('[Hunyuan] 스프링부트 저장 성공:', {
                    videoId: savedVideo.id,
                    videoName: savedVideo.name
                });
            } catch (error) {
                console.error('[Hunyuan] 스프링부트 저장 실패:', error);
                // 저장 실패는 전체 프로세스를 실패시키지 않음
            }
        }

        return NextResponse.json({
            videoUrl: result.data?.video?.url,
            requestId: result.requestId
        }, { status: 200 });
    } catch (error: unknown) {
        console.error("[Hunyuan] 비디오 생성 오류:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "영상 생성 중 오류 발생",
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId');
    if (!requestId) return NextResponse.json({ error: 'requestId required' }, { status: 400 });

    console.log('[Hunyuan] 상태 확인 요청:', { requestId });
    // FAL API의 상태 확인은 클라이언트에서 직접 처리
    return NextResponse.json({ status: 'NOT_SUPPORTED' }, { status: 200 });
} 