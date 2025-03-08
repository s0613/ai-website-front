import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, imageUrl } = body;
    
    // API 호출 (Fal.ai API)
    const result = await fal.subscribe("fal-ai/wan-i2v", {
      input: {
        prompt: prompt,
        image_url: imageUrl  // 이미지 URL을 직접 객체 내에 설정
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