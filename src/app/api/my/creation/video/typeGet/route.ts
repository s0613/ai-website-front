import { NextRequest, NextResponse } from "next/server";

// 유효한 비디오 타입 정의
type ValidVideoType = "IMAGE" | "VIDEO" | "TEXT";

export async function GET(req: NextRequest) {
  try {
    // URL에서 videoType 파라미터 추출
    const { searchParams } = new URL(req.url);
    const videoType = searchParams.get("type");

    // videoType 검증
    if (!videoType) {
      return NextResponse.json(
        { message: "비디오 타입이 필요합니다." },
        { status: 400 }
      );
    }

    // 비디오 타입이 유효한지 검사
    if (!["IMAGE", "VIDEO", "TEXT"].includes(videoType)) {
      return NextResponse.json(
        { message: "유효하지 않은 비디오 타입입니다. 'IMAGE', 'VIDEO', 또는 'TEXT'만 가능합니다." },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/my/videos/type/${videoType}`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 인증 정보 포함
    });

    // 응답 처리
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || `타입 ${videoType}의 비디오를 가져오는데 실패했습니다.` },
        { status: response.status }
      );
    }

    // 성공 시 비디오 목록 반환
    const videos = await response.json();
    return NextResponse.json(videos);
    
  } catch (error) {
    console.error("비디오 타입별 목록 가져오기 API 오류:", error);
    return NextResponse.json(
      { message: error.message || "비디오 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}