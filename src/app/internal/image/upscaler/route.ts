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
            image_url,
            upscaling_factor = 4,
            overlapping_tiles = true,
            checkpoint = "v2",
        } = body;

        // 필수 파라미터 검증
        if (!image_url) {
            return NextResponse.json(
                { error: "image_url is required" },
                { status: 400 }
            );
        }

        // upscaling_factor 유효성 검증
        if (upscaling_factor !== 4) {
            return NextResponse.json(
                { error: "Invalid upscaling_factor. Only 4 is supported currently" },
                { status: 400 }
            );
        }

        // checkpoint 유효성 검증
        const validCheckpoints = ["v1", "v2"];
        if (!validCheckpoints.includes(checkpoint)) {
            return NextResponse.json(
                { error: "Invalid checkpoint. Must be one of: v1, v2" },
                { status: 400 }
            );
        }

        // Upscaler API 호출
        const result = await fal.subscribe("fal-ai/aura-sr", {
            input: {
                image_url,
                upscaling_factor,
                overlapping_tiles,
                checkpoint,
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
        console.error("Error in image upscaling:", error);
        return NextResponse.json(
            { error: "Failed to upscale image" },
            { status: 500 }
        );
    }
}
