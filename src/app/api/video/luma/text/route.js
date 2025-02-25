import { NextResponse } from "next/server";
import { LumaAI } from "lumaai";

export async function POST(request) {
  try {
    const { prompt, aspectRatio, resolution, duration } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // LUMA AI 클라이언트 초기화
    const client = new LumaAI({
      authToken: process.env.LUMA_API_KEY, // .env에 LUMA_API_KEY 설정
    });

    // 텍스트 기반 영상 생성
    let generation = await client.generations.create({
      prompt,
      model: "ray-2",
      resolution,     // 예: "720p", "1080p"
      duration,       // 예: "5s", "10s"
      aspect_ratio: aspectRatio, // 예: "16:9", "1:1", "9:16"
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
        console.log("Dreaming...");
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    // 생성된 영상 URL
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
