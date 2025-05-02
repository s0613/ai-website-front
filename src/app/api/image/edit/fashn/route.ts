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
        const formData = await req.formData();
        const model_image_url = formData.get('model_image_url') as string;
        const garment_image_url = formData.get('garment_image_url') as string;
        const category = formData.get('category') as string || "auto";
        const mode = formData.get('mode') as string || "balanced";
        const garment_photo_type = formData.get('garment_photo_type') as string || "auto";
        const moderation_level = formData.get('moderation_level') as string || "permissive";
        const seed = Number(formData.get('seed')) || 42;
        const num_samples = Number(formData.get('num_samples')) || 1;
        const segmentation_free = formData.get('segmentation_free') !== 'false';

        console.log('Received params:', {
            model_image_url,
            garment_image_url,
            category,
            mode,
            garment_photo_type
        });

        // 필수 파라미터 검증
        if (!model_image_url || !garment_image_url) {
            return NextResponse.json(
                { error: "model_image_url and garment_image_url are required" },
                { status: 400 }
            );
        }

        // category 유효성 검증
        const validCategories = ["tops", "bottoms", "one-pieces", "auto"];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { error: "Invalid category. Must be one of: tops, bottoms, one-pieces, auto" },
                { status: 400 }
            );
        }

        // Fashn API 호출
        const result = await fal.subscribe("fal-ai/fashn/tryon/v1.5", {
            input: {
                model_image: model_image_url,
                garment_image: garment_image_url,
                category,
                mode,
                garment_photo_type,
                moderation_level,
                seed,
                num_samples,
                segmentation_free,
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    console.log(update.logs.map((log) => log.message));
                }
            },
        });

        // 결과 이미지 URL 반환
        return NextResponse.json({
            success: true,
            imageUrl: result.data.images[0]  // 첫 번째 생성된 이미지 URL 반환
        });
    } catch (error) {
        console.error("Error in image generation:", error);
        return NextResponse.json(
            { error: "Failed to generate image", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
