import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export async function POST(req) {
    try {
        const body = await req.json();
        const {
            prompt,
            imageUrl,
            numFrames = 81,
            framesPerSecond = 16,
            seed,
            resolution = "720p",
            numInferenceSteps = 30,
            enableSafetyChecker = true,
            enablePromptExpansion = true
        } = body;

        // API 호출 전 로깅
        console.log("WAN API 호출 시작:", {
            prompt,
            imageUrl,
            numFrames,
            framesPerSecond,
            seed,
            resolution,
            numInferenceSteps,
            enableSafetyChecker,
            enablePromptExpansion
        });

        if (!imageUrl) {
            return NextResponse.json(
                { error: "이미지 URL이 필요합니다." },
                { status: 400 }
            );
        }

        // 최신 WAN Pro API 호출
        const result = await fal.subscribe("fal-ai/wan-pro/image-to-video", {
            input: {
                prompt: prompt,
                image_url: imageUrl,
                seed: seed ? Number(seed) : undefined,
                enable_safety_checker: enableSafetyChecker
                // WAN Pro API는 더 단순화된 파라미터만 필요
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