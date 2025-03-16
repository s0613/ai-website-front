"use server";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(req, { params }) {
  try {
    // URL에서 id 매개변수 추출
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "비디오 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 브라우저 쿠키 가져오기 (await 필수)
    const cookieStore = await cookies();
    const allCookiesArray = cookieStore.getAll();

    // 쿠키를 하나의 문자열로 구성
    const cookieHeader = allCookiesArray
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    // JWT 쿠키 또는 인증에 필요한 쿠키가 있다면 추출
    const jwtCookie = allCookiesArray.find(
      (c) => c.name === "auth-token"
    );

    // 백엔드로 전달할 헤더 구성 (쿠키 및 Authorization)
    const headers = {
      Cookie: cookieHeader,
    };
    
    if (jwtCookie) {
      headers["Authorization"] = `Bearer ${jwtCookie.value}`;
    }

    // 스프링 서버로 API 요청 (GET)
    const response = await fetch(`${baseUrl}/api/my/videos/${id}`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      // 오류 응답 처리
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          return NextResponse.json(
            { message: errorData.message || "비디오 정보를 가져오는데 실패했습니다." },
            { status: response.status }
          );
        } catch (jsonError) {
          console.error("JSON 파싱 오류:", jsonError);
          const errorText = await response.text();
          console.error("원본 응답 텍스트:", errorText);
          return NextResponse.json(
            { message: `서버 오류: ${response.status} ${response.statusText}` },
            { status: response.status }
          );
        }
      } else {
        // JSON이 아닌 응답 처리
        const errorText = await response.text();
        console.error("비-JSON 응답:", errorText);
        return NextResponse.json(
          { message: `서버 오류: ${response.status} ${response.statusText}` },
          { status: response.status }
        );
      }
    }

    // 성공 응답 처리
    let videoData;
    try {
      videoData = await response.json();
    } catch (jsonError) {
      console.error("성공 응답 JSON 파싱 오류:", jsonError);
      const responseText = await response.text();
      console.log("원본 성공 응답:", responseText);
      return NextResponse.json(
        { message: "비디오 정보를 파싱할 수 없습니다." },
        { status: 500 }
      );
    }

    // 성공 응답 반환
    return NextResponse.json({ success: true, video: videoData });
  } catch (error) {
    console.error("비디오 정보 조회 API 오류:", error);
    return NextResponse.json(
      { message: error.message || "비디오 정보 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}