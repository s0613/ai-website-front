import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
// 이전 코드는 input.image_url = imageUrl; 형태로 처리하고 있는데
// 아래와 같이 input 객체를 직접 구성하는 방식으로 수정

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, imageUrl, duration, aspectRatio, cameraControl } = body;
    
    // duration에서 's' 제거
    const durationValue = duration ? parseInt(duration.replace('s', '')) : 5;
    
    // API 호출 (Fal.ai API)
    const result = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
      input: {
        prompt: prompt,
        image_url: imageUrl,
        duration: durationValue,
        aspect_ratio: aspectRatio,
        camera_control: cameraControl
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