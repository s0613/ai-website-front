import { NextResponse } from "next/server";

export async function GET() {
  try {
    // NEXT_PUBLIC_BASE_URL 환경 변수가 제대로 설정되었는지 확인
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL 환경 변수가 설정되지 않았습니다.");
    }
    const imagesUrl = `${baseUrl}/api/images`;
    console.log(`스프링 백엔드에서 이미지 목록 가져오는 중: ${imagesUrl}`);

    // 스프링 백엔드로 GET 요청 전송
    const res = await fetch(imagesUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 인증 토큰이 필요하면 아래 주석을 해제하여 사용하세요.
        // "Authorization": `Bearer ${token}`
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`백엔드 에러: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("백엔드로부터 이미지 데이터 수신");

    return NextResponse.json(data);
  } catch (error) {
    console.error("이미지 가져오기 API 에러:", error);
    return NextResponse.json(
      { message: "이미지 목록을 가져오는데 실패했습니다", error: error.message },
      { status: 500 }
    );
  }
}
