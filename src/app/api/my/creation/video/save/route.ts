"use server";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(req) {
  try {
    // 1) 브라우저 쿠키 가져오기 (await 필수)
    const cookieStore = await cookies();
    const allCookiesArray = cookieStore.getAll();

    // 2) 쿠키를 하나의 문자열로 구성
    const cookieHeader = allCookiesArray
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    // 3) JWT 쿠키 또는 인증에 필요한 쿠키가 있다면 추출
    //    (JWT 명칭은 실제 환경에 맞게 변경: 'auth-token', 'JWT_TOKEN' 등)
    const jwtCookie = allCookiesArray.find(
      (c) =>
        c.name === "auth-token" 

    );

    // 4) 요청 Body에서 필요한 정보 추출
    const body = await req.json();
    const { videoUrl, data } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { message: "비디오 URL이 필요합니다." },
        { status: 400 }
      );
    }

    // 5) 비디오 URL에서 실제 비디오 파일 다운로드
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      return NextResponse.json(
        { message: "비디오 다운로드에 실패했습니다." },
        { status: 500 }
      );
    }

    // Blob으로 변환 (Node.js 환경에서 가능)
    const videoBlob = await videoResponse.blob();

    // 6) mode 결정 로직 (텍스트/이미지/비디오 등)
    let finalMode = "TEXT";
    if (data.imageFile) {
      finalMode = "IMAGE";
    } else if (data.fileUrl) {
      finalMode = "VIDEO";
    }

    // 7) 파일 이름 생성
    const fileName = `video_${Date.now()}.mp4`;

    // 8) FormData 구성
    const formData = new FormData();

    // (a) 비디오 파일 추가
    formData.append(
      "videoFile",
      new Blob([videoBlob], { type: "video/mp4" }),
      fileName
    );

    // (b) 참조 이미지가 있는 경우, 추가 로직
    if (data.fileUrl && finalMode === "IMAGE_TO_VIDEO") {
      try {
        const refResponse = await fetch(data.fileUrl);
        if (refResponse.ok) {
          const refBlob = await refResponse.blob();
          const refFileName =
            data.fileUrl.split("/").pop() || `reference_${Date.now()}.jpg`;
          formData.append("referenceFile", refBlob, refFileName);
        }
      } catch (error) {
        console.error("참조 이미지 추가 실패:", error);
      }
    }

    // (c) 서버 DTO에 맞춰 JSON 데이터 준비
    const requestData = {
      videoName: fileName, // 기존 videoName 필드
      prompt: data.prompt,
      model: data.endpoint,
      mode: finalMode,
    };

    // (d) JSON을 FormData에 추가
    formData.append(
      "data",
      new Blob([JSON.stringify(requestData)], { type: "application/json" })
    );

    console.log("요청 URL:", `${baseUrl}/api/my/videos`);
    console.log("요청 내용:", JSON.stringify(requestData));

    // 9) 백엔드로 전달할 헤더 구성 (쿠키 및 Authorization)
    const headers = {
      // FormData를 사용하는 경우 Content-Type은 자동 설정됨
      Cookie: cookieHeader,
    };
    if (jwtCookie) {
      headers["Authorization"] = `Bearer ${jwtCookie.value}`;
    }

    // 10) 스프링 서버로 API 요청 (POST, FormData 전송)
    const saveResponse = await fetch(`${baseUrl}/api/my/videos`, {
      method: "POST",
      body: formData,
      headers,
      credentials: "include",
    });

    if (!saveResponse.ok) {
      // JSON 파싱 시도 전에 응답 형식 확인
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
        // JSON이 아닌 응답 처리
        const errorText = await saveResponse.text();
        console.error("비-JSON 응답:", errorText);
        return NextResponse.json(
          { message: `서버 오류: ${saveResponse.status} ${saveResponse.statusText}` },
          { status: saveResponse.status }
        );
      }
    }

    // 성공 응답도 마찬가지로 JSON 파싱 오류 처리
    let savedVideo;
    try {
      savedVideo = await saveResponse.json();
    } catch (jsonError) {
      console.error("성공 응답 JSON 파싱 오류:", jsonError);
      const responseText = await saveResponse.text();
      console.log("원본 성공 응답:", responseText);
      savedVideo = { message: "비디오가 저장되었지만 응답을 파싱할 수 없습니다." };
    }

    // 12) 성공 응답
    return NextResponse.json({ success: true, video: savedVideo });
  } catch (error) {
    console.error("비디오 저장 API 오류:", error);
    return NextResponse.json(
      { message: error.message || "비디오 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
