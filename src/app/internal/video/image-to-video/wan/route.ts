import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { saveVideoFromUrl } from '@/app/internal/video/services/VideoStorageService';

interface WanRequest {
    prompt: string;
    imageUrl: string;
    numFrames?: number;
    framesPerSecond?: number;
    seed?: number;
    resolution?: string;
    numInferenceSteps?: number;
    enableSafetyChecker?: boolean;
    enablePromptExpansion?: boolean;
    userId: string;
    notificationId?: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as WanRequest;
        const {
            prompt,
            imageUrl,
            numFrames = 81,
            framesPerSecond = 16,
            seed,
            resolution = "720p",
            numInferenceSteps = 30,
            enableSafetyChecker = true,
            enablePromptExpansion = true,
            userId,
            notificationId
        } = body;

        // 필수 파라미터 검증
        const missingParams = [];
        if (!prompt) missingParams.push('prompt');
        if (!imageUrl) missingParams.push('imageUrl');
        if (!userId) missingParams.push('userId');

        if (missingParams.length > 0) {
            console.error('[WAN] 필수 파라미터 누락:', missingParams);
            return NextResponse.json(
                {
                    error: "필수 파라미터가 누락되었습니다.",
                    missingParams
                },
                { status: 400 }
            );
        }

        // API 호출 전 로깅
        console.log("[WAN] API 호출 시작:", {
            prompt,
            imageUrl,
            numFrames,
            framesPerSecond,
            seed,
            resolution,
            numInferenceSteps,
            enableSafetyChecker,
            enablePromptExpansion,
            notificationId
        });

        // WAN Pro API 호출
        const result = await fal.subscribe("fal-ai/wan-pro/image-to-video", {
            input: {
                prompt: prompt,
                image_url: imageUrl,
                seed: seed ? Number(seed) : undefined,
                enable_safety_checker: enableSafetyChecker
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log('[WAN] 처리 중:', update.logs.map((log) => log.message));
                }
            },
        });

        console.log('[WAN] 영상 생성 완료:', {
            requestId: result.requestId,
            videoUrl: result.data?.video?.url
        });

        // 비디오 생성이 완료되면 스프링부트 서버에 저장
        if (result.data?.video?.url) {
            try {
                console.log('[WAN] 스프링부트 저장 요청 시작');
                const savedVideo = await saveVideoFromUrl({
                    prompt,
                    endpoint: 'wan',
                    model: 'wan-pro/image-to-video',
                    videoName: `WAN Video - ${new Date().toISOString()}`,
                    videoUrl: result.data.video.url,
                    referenceUrl: imageUrl,
                    activeTab: 'image',
                    userId: userId,
                });
                console.log('[WAN] 스프링부트 저장 성공:', {
                    videoId: savedVideo.id,
                    videoName: savedVideo.name
                });
            } catch (error) {
                console.error('[WAN] 스프링부트 저장 실패:', error);
                // 저장 실패는 전체 프로세스를 실패시키지 않음
            }
        }

        return NextResponse.json(
            { videoUrl: result.data.video.url, requestId: result.requestId },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("[WAN] 비디오 생성 오류:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "영상 생성 중 오류 발생",
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId');
    if (!requestId) return NextResponse.json({ error: 'requestId required' }, { status: 400 });

    console.log('[WAN] 상태 확인 요청:', { requestId });
    // FAL API의 상태 확인은 클라이언트에서 직접 처리
    return NextResponse.json({ status: 'NOT_SUPPORTED' }, { status: 200 });
} 