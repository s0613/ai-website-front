"use server";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

export async function POST(request) {
  try {
    // 1) 클라이언트에서 전송한 formData 추출
    const formData = await request.formData();
    const video = formData.get('aiVideo');
    const videoName = formData.get('aiVideoName');
    const referenceFile = formData.get('modeFile');
    const prompt = formData.get('prompt');
    const model = formData.get('model'); // 모델 정보 가져오기

    if (!video || !videoName || !prompt) {
      return NextResponse.json(
        { error: '비디오, 이름, 프롬프트가 모두 필요합니다.' },
        { status: 400 }
      );
    }

    // 2) 파일이 비디오인지 확인
    if (!video.type.startsWith('video/')) {
      return NextResponse.json(
        { error: '비디오 파일만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 3) 백엔드 전송용 FormData 생성
    const backendFormData = new FormData();
    // 비디오 파일 추가 (키 이름은 Spring Boot API에 맞게 조정)
    backendFormData.append('AIVideo', video);
    // modeFile이 있을 경우 추가
    if (referenceFile) {
      backendFormData.append('referenceFile', referenceFile);
    }
    // JSON 데이터를 Blob으로 감싸서 추가 (Content-Type: application/json)
    const videoRequest = {
      name: videoName,
      prompt: prompt,
      model: model || 'veo2',
    };
    const videoRequestBlob = new Blob(
      [JSON.stringify(videoRequest)],
      { type: 'application/json' }
    );
    backendFormData.append('request', videoRequestBlob);

    console.log('요청 URL:', `${BASE_URL}/api/admin/videos`);
    console.log('요청 내용:', JSON.stringify(videoRequest));

    // 4) Next.js 서버에서 브라우저 쿠키 추출 (await 필수)
    const cookieStore = await cookies();
    const allCookiesArray = cookieStore.getAll();
    const cookieHeader = allCookiesArray.map(c => `${c.name}=${c.value}`).join('; ');

    // 5) JWT 쿠키가 있을 경우 (키 이름은 실제 환경에 맞게 수정)
    const jwtCookie = allCookiesArray.find(
      c => c.name === "JWT_TOKEN" || c.name === "auth-token" || c.name === "access_token"
    );

    // 6) 백엔드 API 호출 시 헤더에 쿠키와 Authorization 헤더 추가
    const headers = {
      // FormData를 사용하는 경우 Content-Type은 자동 설정됨
      Cookie: cookieHeader,
    };
    if (jwtCookie) {
      headers["Authorization"] = `Bearer ${jwtCookie.value}`;
    }

    // 7) 백엔드 API 호출 (비디오 저장 API)
    const backendResponse = await fetch(`${BASE_URL}/api/admin/videos`, {
      method: 'POST',
      body: backendFormData,
      headers,
      credentials: 'include',
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('백엔드 오류:', backendResponse.status, errorText);
      throw new Error(`백엔드 API 호출 실패: ${backendResponse.status} - ${errorText}`);
    }

    // 8) 백엔드 응답 처리 및 반환
    const responseData = await backendResponse.json();
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('비디오 업로드 중 오류 발생:', error);
    return NextResponse.json(
      { error: '비디오 업로드 실패: ' + error.message },
      { status: 500 }
    );
  }
}
