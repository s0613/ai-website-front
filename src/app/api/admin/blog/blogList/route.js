import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Java 백엔드의 블로그 목록 엔드포인트 호출 (필요에 따라 URL 수정)
    const res = await fetch("http://localhost:8080/api/blogs");
    if (!res.ok) {
      throw new Error("블로그 목록을 가져오는데 실패했습니다.");
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API 에러:", error);
    return NextResponse.json(
      { message: error.message || "알 수 없는 에러 발생" },
      { status: 500 }
    );
  }
}
