import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  try {
    // 요청 본문에서 ID와 공유 상태 추출
    const body = await req.json();
    const { id, share } = body;

    if (id === undefined) {
      return NextResponse.json(
        { message: "비디오 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/my/videos/${id}/share`;
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ share }),
      credentials: 'include', // 인증 쿠키 포함
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "공유 상태 변경에 실패했습니다");
    }

    // 백엔드 응답 그대로 반환
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("공유 상태 변경 API 오류:", error);
    return NextResponse.json(
      { message: error.message || "공유 상태를 변경하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}