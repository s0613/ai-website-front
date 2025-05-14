import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export async function POST(req) {
    try {
        const body = await req.json();
        const { prompt, imageUrl, duration, aspectRatio, cameraControl } = body;

        // duration에서 's' 제거 및 안전한 파싱
        const durationValue = typeof duration === 'string'
            ? parseInt(duration.replace('s', ''))
            : (typeof duration === 'number' ? duration : 5);

        // API 호출 (Fal.ai API)
        const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
            input: {
                prompt: prompt,
                image_url: imageUrl,
                duration: durationValue,
                aspect_ratio: aspectRatio,
                camera_control: cameraControl
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });

        return NextResponse.json(
            { videoUrl: result.data.video.url, requestId: result.requestId },
            { status: 200 }
        );
    } catch (error) {
        console.error("비디오 생성 오류:", error);
        return NextResponse.json(
            { error: error.message || "영상 생성 중 오류 발생" },
            { status: 500 }
        );
    }
} 