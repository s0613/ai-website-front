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

    // 1) 쿠키 가져오기
    const cookieStore = await cookies();
    const allCookiesArray = cookieStore.getAll();
    const jwtCookie = allCookiesArray.find(
      (c) => c.name === "auth-token"
    );

    // 2) 백엔드 요청 헤더 준비
    const cookieHeader = allCookiesArray
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    };

    // JWT 토큰이 있으면 Authorization 헤더에 추가
    if (jwtCookie) {
      headers["Authorization"] = `Bearer ${jwtCookie.value}`;
    }

    // 3) API URL 로깅
    const apiUrl = `${baseUrl}/api/videos/shared`;
    console.log("요청 전체 URL:", apiUrl);
    console.log("요청 헤더:", headers);

    // 4) 백엔드 API 호출
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      credentials: "include",
      cache: 'no-store'
    });
    
    // 5) 응답 상태 로깅
    console.log("응답 상태:", response.status, response.statusText);
    console.log("응답 헤더:", Object.fromEntries(response.headers.entries()));

    // 6) 응답 바디를 "단 한 번만" text()로 읽는다
    const rawBody = await response.text();
    console.log("원시 응답 내용:", rawBody.substring(0, 200) + "..."); // 내용이 많을 경우 잘라서 출력

    // 7) 에러인 경우(백엔드 응답이 200~299 범위가 아님)
    if (!response.ok) {
      let errorMessage = "공유된 비디오 데이터를 가져오는데 실패했습니다";

      // 7-1) text()로 읽은 rawBody를 JSON.parse() 시도 → 실패하면 그냥 텍스트로 처리
      try {
        const parsedError = JSON.parse(rawBody);
        if (parsedError.message) {
          errorMessage = parsedError.message;
        }
      } catch {
        // JSON 형식이 아니면, rawBody가 그대로 에러 메시지일 수도 있으니 대체
        if (rawBody) {
          errorMessage = rawBody;
        }
      }

      return NextResponse.json({ message: errorMessage }, { status: response.status });
    }

    // 8) 정상인 경우
    // 8-1) rawBody를 JSON.parse 시도
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      // 만약 진짜 JSON이 아닌 경우, 필요하다면 그대로 텍스트로 처리
      data = rawBody;
    }

    // 9) 최종 응답
    return NextResponse.json(data);
  } catch (error) {
    console.error("공유된 비디오 가져오기 API 오류:", error);
    return NextResponse.json(
      { message: "공유된 비디오를 가져오는 중 오류가 발생했습니다: " + (error instanceof Error ? error.message : "알 수 없는 오류") },
      { status: 500 }
    );
  }
}