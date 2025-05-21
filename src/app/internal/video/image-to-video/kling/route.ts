/* …생략: import, validation 등 기존 코드 … */

import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { saveVideoFromUrl } from '@/app/internal/video/services/VideoStorageService';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('[Kling] 요청 본문:', body);

        const { prompt, imageUrl, duration, aspect_ratio, camera_control, notificationId, userId } = body;

        // 필수 파라미터 검증
        const missingParams = [];
        if (!prompt) missingParams.push('prompt');
        if (!imageUrl) missingParams.push('imageUrl');
        if (!userId) missingParams.push('userId');

        if (missingParams.length > 0) {
            console.error('[Kling] 필수 파라미터 누락:', missingParams);
            return NextResponse.json(
                {
                    error: "필수 파라미터가 누락되었습니다.",
                    missingParams
                },
                { status: 400 }
            );
        }

        console.log('[Kling] 영상 생성 요청 시작:', {
            prompt,
            imageUrl,
            duration,
            aspect_ratio,
            camera_control,
            notificationId
        });

        const requestId = crypto.randomUUID();

        // Kling API 호출
        const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
            input: {
                prompt,
                image_url: imageUrl,
                duration: duration === "10" ? "10" : "5",
                aspect_ratio: aspect_ratio ?? "16:9",
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log('[Kling] 처리 중:', update.logs.map((log) => log.message));
                }
            },
        });

        console.log('[Kling] 영상 생성 완료:', {
            requestId: result.requestId,
            videoUrl: result.data?.video?.url
        });

        // 비디오 생성이 완료되면 스프링부트 서버에 저장
        if (result.data?.video?.url) {
            try {
                console.log('[Kling] 스프링부트 저장 요청 시작');
                const savedVideo = await saveVideoFromUrl({
                    prompt,
                    endpoint: 'kling',
                    model: 'kling-video/v1.6/pro',
                    videoName: `Kling Video - ${new Date().toISOString()}`,
                    videoUrl: result.data.video.url,
                    referenceUrl: imageUrl,
                    activeTab: 'image',
                    userId: userId,
                });
                console.log('[Kling] 스프링부트 저장 성공:', {
                    videoId: savedVideo.id,
                    videoName: savedVideo.name
                });
            } catch (error) {
                console.error('[Kling] 스프링부트 저장 실패:', error);
                // 저장 실패는 전체 프로세스를 실패시키지 않음
            }
        }

        return NextResponse.json({
            videoUrl: result.data?.video?.url,
            requestId: result.requestId
        }, { status: 200 });

    } catch (error) {
        console.error('[Kling] 영상 생성 오류:', error);
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

    console.log('[Kling] 상태 확인 요청:', { requestId });
    // FAL API의 상태 확인은 클라이언트에서 직접 처리
    return NextResponse.json({ status: 'NOT_SUPPORTED' }, { status: 200 });
}
