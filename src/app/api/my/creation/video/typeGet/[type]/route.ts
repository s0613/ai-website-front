"use server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 예시: baseUrl (백엔드 주소)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(request: Request, { params }) {
  try {
    if (!baseUrl) {
      console.error("API URL 환경 변수가 설정되지 않았습니다");
      return NextResponse.json(
        { message: "서버 구성 오류: API URL이 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    // URL 경로에서 type 파라미터 추출
    const type = params.type; // "image", "video", "text"

    if (!type) {
      return NextResponse.json(
        { message: "type 경로 파라미터가 필요합니다" },
        { status: 400 }
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

    // 백엔드 API URL
    const apiUrl = `${baseUrl}/api/my/videos/type/${type.toUpperCase()}`;
    console.log("요청 URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      credentials: "include",
      cache: 'no-store'
    });

    console.log("응답 상태:", response.status, response.statusText);

    if (!response.ok) {
      let errorMessage = "비디오 데이터를 가져오는데 실패했습니다";
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

    // 정상 응답
    const videos = await response.json();
    return NextResponse.json(videos);
  } catch (error) {
    console.error("타입별 비디오 가져오기 API 오류:", error);
    return NextResponse.json(
      {
        message: "타입별 비디오를 가져오는 중 오류가 발생했습니다: " + error.message,
      },
      { status: 500 }
    );
  }
}