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
            model_image,
            garment_image,
            category,
            garment_photo_type = "auto",
            nsfw_filter = true,
            cover_feet = false,
            adjust_hands = false,
            restore_background = false,
            restore_clothes = false,
            long_top = false,
            guidance_scale = 2,
            timesteps = 50,
            seed = 42,
            num_samples = 1,
        } = body;

        // 필수 파라미터 검증
        if (!model_image || !garment_image || !category) {
            return NextResponse.json(
                { error: "model_image, garment_image, and category are required" },
                { status: 400 }
            );
        }

        // category 유효성 검증
        const validCategories = ["tops", "bottoms", "one-pieces"];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { error: "Invalid category. Must be one of: tops, bottoms, one-pieces" },
                { status: 400 }
            );
        }

        // Fashn API 호출
        const result = await fal.subscribe("fashn/tryon", {
            input: {
                model_image,
                garment_image,
                category,
                garment_photo_type,
                nsfw_filter,
                cover_feet,
                adjust_hands,
                restore_background,
                restore_clothes,
                long_top,
                guidance_scale,
                timesteps,
                seed,
                num_samples,
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
        console.error("Error in image generation:", error);
        return NextResponse.json(
            { error: "Failed to generate image" },
            { status: 500 }
        );
    }
}
