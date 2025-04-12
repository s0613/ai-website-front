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

        // API 호출 (Fal.ai API)
        const result = await fal.subscribe("fal-ai/wan-i2v", {
            input: {
                prompt: prompt,
                image_url: imageUrl,
                num_frames: Number(numFrames),
                frames_per_second: Number(framesPerSecond),
                seed: seed ? Number(seed) : undefined,
                resolution: resolution,
                num_inference_steps: Number(numInferenceSteps),
                enable_safety_checker: enableSafetyChecker,
                enable_prompt_expansion: enablePromptExpansion
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