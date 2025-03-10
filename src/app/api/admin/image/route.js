import { NextResponse } from "next/server";

// POST 요청 처리
export async function POST(request) {
  try {
    // multipart/form-data 파싱
    const formData = await request.formData();
    const category = formData.get("category");
    const images = formData.getAll("images"); // 파일 배열

    // 스프링 백엔드로 전송할 새 FormData 생성
    const backendFormData = new FormData();
    backendFormData.append("category", category);
    
    // 모든 이미지 파일을 FormData에 추가
    for (const image of images) {
      backendFormData.append("images", image);
    }

    // 환경 변수에서 백엔드 URL 가져오기
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const uploadUrl = `${baseUrl}/api/images/upload`;
    
    console.log(`스프링 백엔드로 요청 전송: ${uploadUrl}`);
    
    // 스프링 백엔드로 요청 전송
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: backendFormData,
      // 인증 정보가 필요한 경우 아래 주석을 해제하고 토큰을 설정
      // headers: {
      //   "Authorization": `Bearer ${token}`
      // }
    });

    if (!response.ok) {
      throw new Error(`백엔드 에러: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("백엔드 응답:", data);

    return NextResponse.json(
      { ...data },
      { status: response.status }
    );
  } catch (error) {
    console.error("API 에러:", error);
    return NextResponse.json(
      { message: "업로드 실패", error: error.message },
      { status: 500 }
    );
  }
}