import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 백엔드 API 호출
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/my/videos/user`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: 'include', // 인증 쿠키 포함
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "비디오 데이터를 가져오는데 실패했습니다");
    }

    const videos = await response.json();
    return NextResponse.json(videos);
  } catch (error) {
    console.error("비디오 가져오기 API 오류:", error);
    return NextResponse.json(
      { message: error.message || "비디오를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}