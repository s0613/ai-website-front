"use server";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(req) {
  try {
    // 1) 브라우저 쿠키 가져오기
    const cookieStore = await cookies();
    const allCookiesArray = cookieStore.getAll();
    const cookieHeader = allCookiesArray
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    // JWT 쿠키 추출
    const jwtCookie = allCookiesArray.find(
      (c) => c.name === "auth-token"
    );

    // 2) FormData 요청 처리
    const formData = await req.formData();
    
    // 3) 비디오 파일과 JSON 데이터 추출
    const videoFile = formData.get("videoFile");
    const modeFile = formData.get("modeFile");
    const jsonData = JSON.parse(formData.get("data"));
    
    if (!videoFile) {
      return NextResponse.json(
        { message: "비디오 파일이 필요합니다." },
        { status: 400 }
      );
    }

    // 4) mode 결정 로직
    let finalMode = "TEXT";
    if (modeFile) {
      // 파일 타입에 따라 모드 설정
      const fileType = modeFile.type || "";
      if (fileType.startsWith("image/")) {
        finalMode = "IMAGE";
      } else if (fileType.startsWith("video/")) {
        finalMode = "VIDEO";
      }
    }

    // 5) 스프링 서버로 전송할 FormData 구성
    const serverFormData = new FormData();
    
    // 비디오 파일 추가
    serverFormData.append("videoFile", videoFile);
    
    // 참조 파일이 있는 경우 추가
    if (modeFile) {
      serverFormData.append("referenceFile", modeFile);
    }
    
    // 서버 DTO 구성
    const requestData = {
      videoName: jsonData.videoName,
      prompt: jsonData.prompt,
      model: jsonData.endpoint,
      mode: finalMode,
    };
    
    // DTO를 FormData에 추가
    serverFormData.append(
      "data",
      new Blob([JSON.stringify(requestData)], { type: "application/json" })
    );

    // 6) 백엔드로 전달할 헤더 구성
    const headers = { Cookie: cookieHeader };
    if (jwtCookie) {
      headers["Authorization"] = `Bearer ${jwtCookie.value}`;
    }

    // 7) 스프링 서버로 API 요청
    const saveResponse = await fetch(`${baseUrl}/api/my/videos`, {
      method: "POST",
      body: serverFormData,
      headers,
      credentials: "include",
    });

    // 응답 처리 (기존 코드와 동일)
    if (!saveResponse.ok) {
      const contentType = saveResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await saveResponse.json();
          return NextResponse.json(
            { message: errorData.message || "비디오 저장에 실패했습니다." },
            { status: saveResponse.status }
          );
        } catch (jsonError) {
          console.error("JSON 파싱 오류:", jsonError);
          const errorText = await saveResponse.text();
          console.error("원본 응답 텍스트:", errorText);
          return NextResponse.json(
            { message: `서버 오류: ${saveResponse.status} ${saveResponse.statusText}` },
            { status: saveResponse.status }
          );
        }
      } else {
        const errorText = await saveResponse.text();
        console.error("비-JSON 응답:", errorText);
        return NextResponse.json(
          { message: `서버 오류: ${saveResponse.status} ${saveResponse.statusText}` },
          { status: saveResponse.status }
        );
      }
    }

    // 성공 응답 처리
    let savedVideo;
    try {
      savedVideo = await saveResponse.json();
    } catch (jsonError) {
      console.error("성공 응답 JSON 파싱 오류:", jsonError);
      const responseText = await saveResponse.text();
      console.log("원본 성공 응답:", responseText);
      savedVideo = { message: "비디오가 저장되었지만 응답을 파싱할 수 없습니다." };
    }

    return NextResponse.json({ success: true, video: savedVideo });
  } catch (error) {
    console.error("비디오 저장 API 오류:", error);
    return NextResponse.json(
      { message: error.message || "비디오 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}