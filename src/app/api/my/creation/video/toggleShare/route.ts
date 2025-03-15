"use server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // 클라이언트에서 넘겨준 JSON body 파싱
    const body = await request.json();
    const { id, share } = body;

    if (typeof id !== "number" || typeof share !== "boolean") {
      return NextResponse.json(
        { message: "잘못된 요청 데이터입니다" },
        { status: 400 }
      );
    }

    // 쿠키 & JWT
    const cookieStore = cookies();
    const allCookiesArray = cookieStore.getAll();
    const jwtCookie = allCookiesArray.find(
      (c) =>
        c.name === "JWT_TOKEN" ||
        c.name === "access_token" ||
        c.name === "auth-token"
    );

    if (!jwtCookie) {
      return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
    }

    const cookieHeader = allCookiesArray
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const headers = {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
      Authorization: `Bearer ${jwtCookie.value}`,
    };

    // 백엔드 API 호출
    // 예: PATCH /api/my/videos/{id}/share?share=true
    // 또는 body를 통해 share 전달
    const apiUrl = `${baseUrl}/api/my/videos/${id}/share?share=${share}`;
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = "공유 상태 변경 실패";
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

    // 성공적으로 바뀐 내용
    const updatedData = await response.json();
    return NextResponse.json(updatedData);
  } catch (error) {
    console.error("공유 상태 변경 API 오류:", error);
    return NextResponse.json(
      { message: "공유 상태를 변경하는 중 오류가 발생했습니다: " + error.message },
      { status: 500 }
    );
  }
}
