import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export async function POST(req) {
    try {
        const body = await req.json();
        const { prompt, imageUrl, seed, aspectRatio, resolution = "720p", numFrames = 129 } = body;

        // API 호출 전 로깅
        console.log("API 호출 시작:", {
            prompt,
            imageUrl,
            seed,
            aspectRatio,
            resolution,
            numFrames
        });

        if (!imageUrl) {
            return NextResponse.json(
                { error: "이미지 URL이 필요합니다." },
                { status: 400 }
            );
        }

        // API 호출 (Fal.ai API)
        const result = await fal.subscribe("fal-ai/hunyuan-video-image-to-video", {
            input: {
                prompt: prompt,
                image_url: imageUrl,
                seed: seed,
                aspect_ratio: aspectRatio || "16:9",
                resolution: resolution || "720p",
                num_frames: numFrames || 129
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });

        // 결과 로깅
        console.log("API 응답 성공:", result.requestId);

        if (!result.data?.video?.url) {
            console.error("비디오 URL 없음:", result.data);
            return NextResponse.json(
                { error: "비디오 URL을 받지 못했습니다" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { videoUrl: result.data.video.url, requestId: result.requestId },
            { status: 200 }
        );
    } catch (error) {
        // 오류 상세 정보 로깅
        console.error("비디오 생성 오류:", error);
        console.error("오류 세부 정보:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
            response: error.response
        });

        // JSON 파싱 오류 처리
        if (error.message && error.message.includes("Unexpected token")) {
            return NextResponse.json(
                { error: "API 응답 형식이 올바르지 않습니다. 서버 상태를 확인해 주세요." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: error.message || "영상 생성 중 오류 발생" },
            { status: 500 }
        );
    }
} 