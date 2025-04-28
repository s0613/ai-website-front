import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

if (!process.env.FAL_KEY) {
    throw new Error("Missing FAL_KEY environment variable");
}

fal.config({
    credentials: process.env.FAL_KEY,
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            prompt,
            image_url,
            seed,
            aspect_ratio = "16:9",
            resolution = "720p",
            num_frames = 129,
            i2v_stability = false,
        } = body;

        // 필수 파라미터 검증
        if (!prompt || !image_url) {
            return NextResponse.json(
                { error: "Prompt and image_url are required" },
                { status: 400 }
            );
        }

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
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log(update.logs.map((log) => log.message));
                }
            },
        });

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("Error in video generation:", error);
        return NextResponse.json(
            { error: "Failed to generate video" },
            { status: 500 }
        );
    }
} 