"use server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 백엔드 주소 확인
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET() {
  try {
    if (!baseUrl) {
      console.error("API URL 환경 변수가 설정되지 않았습니다");
      return NextResponse.json(
        { message: "서버 구성 오류: API URL이 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    // 쿠키 가져오기
    const cookieStore = await cookies();
    const allCookiesArray = cookieStore.getAll();
    const jwtCookie = allCookiesArray.find(
      (c) => c.name === "auth-token"
    );

    if (!jwtCookie) {
      return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
    }

    // 헤더 구성
    const cookieHeader = allCookiesArray
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    
    const headers = {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
      Authorization: `Bearer ${jwtCookie.value}`,
    };

    // 백엔드 API URL 구성 (GET /api/videos/like/my)
    const apiUrl = `${baseUrl}/api/videos/like/my`;
    
    console.log("좋아요한 비디오 목록 조회 요청");
    console.log(`요청 URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      credentials: "include",
      cache: 'no-store'
    });

    if (!response.ok) {
      let errorMessage = "좋아요한 비디오 목록을 가져오는데 실패했습니다";
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (jsonErr) {
        console.error("JSON 파싱 실패:", jsonErr);
      }
      return NextResponse.json({ message: errorMessage }, { status: response.status });
    }

    // 성공 응답
    const likedVideos = await response.json();
    return NextResponse.json(likedVideos);
  } catch (error) {
    console.error("좋아요한 비디오 목록 조회 API 오류:", error);
    return NextResponse.json(
      {
        message: "좋아요한 비디오 목록을 가져오는 중 오류가 발생했습니다: " + error,
      },
      { status: 500 }
    );
  }
}