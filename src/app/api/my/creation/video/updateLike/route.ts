"use server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// 백엔드 주소 확인
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function PATCH(request: Request) {
  try {
    if (!baseUrl) {
      console.error("API URL 환경 변수가 설정되지 않았습니다");
      return NextResponse.json(
        { message: "서버 구성 오류: API URL이 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    // 요청 본문에서 필요한 파라미터 추출
    const { id, like } = await request.json();

    if (id === undefined) {
      return NextResponse.json(
        { message: "비디오 ID가 필요합니다" },
        { status: 400 }
      );
    }

    if (like === undefined) {
      return NextResponse.json(
        { message: "좋아요 상태(like)가 필요합니다" },
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

    // 백엔드 API URL 구성 (PATCH /api/my/videos/{id}/like?like={boolean})
    // like 값을 쿼리 파라미터로 전달
    const apiUrl = `${baseUrl}/api/videos/like/${id}?like=${like}`;
    
    console.log(`비디오 좋아요 요청: ID=${id}, like=${like}`);
    console.log(`요청 URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers,
      credentials: "include",
      cache: 'no-store'
    });

    if (!response.ok) {
      let errorMessage = "좋아요 상태 업데이트에 실패했습니다";
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
    const updatedVideo = await response.json();
    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error("비디오 좋아요 업데이트 API 오류:", error);
    return NextResponse.json(
      {
        message: "좋아요 상태를 업데이트하는 중 오류가 발생했습니다: " + error,
      },
      { status: 500 }
    );
  }
}