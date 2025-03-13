import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const video = formData.get('aiVideo');
    const videoName = formData.get('aiVideoName');
    const modeFile = formData.get('modeFile');
    const prompt = formData.get('prompt');
    const model = formData.get('model'); // 모델 정보 가져오기
    

    if (!video || !videoName || !prompt) {
      return NextResponse.json(
        { error: '비디오, 이름, 프롬프트가 모두 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일이 비디오인지 확인
    if (!video.type.startsWith('video/')) {
      return NextResponse.json(
        { error: '비디오 파일만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }

    // Spring Boot API로 전송할 formData 생성
    const backendFormData = new FormData();
    backendFormData.append('AIVideo', video);  // 'file'에서 'AIVideo'로 변경

    // modeFile이 있는 경우에만 추가
    if (modeFile) {
      backendFormData.append('modeFile', modeFile);
    }

    // JSON 데이터를 Blob으로 감싸서 Content-Type을 application/json으로 지정
    const videoRequest = {
      name: videoName,
      prompt: prompt,
      model: model || 'veo2',
    };
    const videoRequestBlob = new Blob([JSON.stringify(videoRequest)], { type: 'application/json' });
    backendFormData.append('request', videoRequestBlob);

    console.log('요청 URL:', `${BASE_URL}/api/admin/videos`);
    console.log('요청 내용:', JSON.stringify(videoRequest));

    // 스프링 백엔드 서버로 요청 (환경 변수 사용)
    const backendResponse = await fetch(`${BASE_URL}/api/admin/videos`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('백엔드 오류:', backendResponse.status, errorText);
      throw new Error(`백엔드 API 호출 실패: ${backendResponse.status} - ${errorText}`);
    }

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
