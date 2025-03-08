import { NextResponse } from "next/server";
import { LumaAI } from "lumaai";

export async function POST(request) {
  try {
    const { prompt, imageUrl, aspectRatio, resolution, duration } =
      await request.json();

    if (!prompt || !imageUrl) {
      return NextResponse.json(
        { error: "prompt와 imageUrl이 모두 필요합니다." },
        { status: 400 }
      );
    }

    // LUMA AI 클라이언트 초기화
    const client = new LumaAI({
      authToken: process.env.LUMA_API_KEY, // .env 파일에 LUMA_API_KEY 설정
    });

    // 이미지 기반 영상 생성
    let generation = await client.generations.create({
      prompt,
      model: "ray-2",
      keyframes: {
        frame0: {
          type: "image",
          url: imageUrl,
        },
      },
      resolution,           // 예: "720p", "1080p", "4k"
      duration,             // 예: "5s", "10s"
      aspect_ratio: aspectRatio,  // 예: "16:9", "1:1", "9:16"
    });

    // 생성이 완료될 때까지 폴링
    let completed = false;
    while (!completed) {
      generation = await client.generations.get(generation.id);
      if (generation.state === "completed") {
        completed = true;
      } else if (generation.state === "failed") {
        throw new Error(`Generation failed: ${generation.failure_reason}`);
      } else {
        console.log("Dreaming with image keyframe...");
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    // 완료 후 영상 URL
    const videoUrl = generation.assets.video;
    return NextResponse.json({ videoUrl }, { status: 200 });
  } catch  {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "영상 생성 중 오류 발생" },
      { status: 500 }
    );
  }
}
