import { NextRequest, NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

if (!process.env.FAL_KEY) {
    throw new Error('Missing FAL_KEY environment variable');
}

// FAL.ai API 키 설정
fal.config({
    credentials: process.env.FAL_KEY
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, image_url, aspect_ratio = 'auto', duration = '5s' } = body;

        // 필수 파라미터 검증
        if (!prompt || !image_url) {
            return NextResponse.json(
                { error: 'Prompt and image_url are required' },
                { status: 400 }
            );
        }

        // Veo2 API 호출
        const result = await fal.subscribe('fal-ai/veo2/image-to-video', {
            input: {
                prompt,
                image_url,
                aspect_ratio,
                duration,
            },
            logs: true,
        });

        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error processing video generation:', error);
        return NextResponse.json(
            { error: 'Failed to process video generation' },
            { status: 500 }
        );
    }
}
