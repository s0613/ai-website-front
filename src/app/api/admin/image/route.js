import { NextResponse } from "next/server";

// POST 요청 처리
export async function POST(request) {
  try {
    // multipart/form-data 파싱
    const formData = await request.formData();
    const category = formData.get("category");
    const images = formData.getAll("images"); // 파일 배열

    // TODO: 여기서 파일 업로드 처리 또는 백엔드 연동 로직 추가
    // 예시로 각 파일의 이름을 추출
    const fileNames = images.map((file) => file.name);

    console.log("업로드된 파일들:", fileNames);
    console.log("선택한 카테고리:", category);

    return NextResponse.json(
      { message: "이미지 업로드 성공", fileNames, category },
      { status: 200 }
    );
  } catch (error) {
    console.error("API 에러:", error);
    return NextResponse.json(
      { message: "업로드 실패", error: error.message },
      { status: 500 }
    );
  }
}
