import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // 클라이언트에서 전송된 FormData 파싱
    const formData = await request.formData();
    const title = formData.get("title");
    const subtitle = formData.get("subtitle");
    const author = formData.get("author");
    const content = formData.get("content");
    const imageFile = formData.get("image");

    // FormData 객체에 블로그 데이터 추가
    const payload = new FormData();
    payload.append("blog", new Blob([JSON.stringify({ title, subtitle, author, content })], { type: "application/json" }));
    if (imageFile) {
      payload.append("image", imageFile);
    }

    // Java 백엔드의 블로그 생성 엔드포인트 호출
    const res = await fetch("http://localhost:8080/api/blogs", {
      method: "POST",
      body: payload,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { message: "블로그 등록 실패", error: errorData.message },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("블로그 등록 API 에러:", error);
    return NextResponse.json(
      { message: "에러 발생", error: error.message },
      { status: 500 }
    );
  }
}