import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// .env 혹은 Vercel 환경변수에 BASE_URL이 세팅되어 있다고 가정
// 예) NEXT_PUBLIC_BASE_URL=http://localhost:8080
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * 폴더 생성 API 핸들러
 * - 서버 측(백엔드)에서는 쿠키에서 JWT를 추출해 인증을 진행
 * - 별도의 Authorization 헤더 없이 credentials: 'include' 만으로 쿠키를 전송
 */
export async function POST(request) {
  try {
    // 1) 쿠키에서 JWT 토큰 확인 (비동기!)
    //    await cookies() 로 cookieStore를 받아온 뒤, .get('auth-token')
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    // 토큰이 없으면 401 Unauthorized 반환
    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 2) 요청 바디 파싱 (폴더 이름 등)
    const body = await request.json();
    console.log('요청 바디:', body);

    // 3) 백엔드 /api/folders 엔드포인트로 POST 전송
    //    쿠키 기반 인증을 위해 credentials: 'include' 설정
    //    (필요하다면 'Cookie': `auth-token=${token}` 등 직접 헤더에 추가 가능)
    const response = await fetch(`${BASE_URL}/api/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 스프링 서버가 쿠키로 인증한다면 쿠키를 직접 넣어줄 수도 있음:
        'Cookie': `auth-token=${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log('백엔드 응답 상태:', response.status);
    console.log('백엔드 응답 헤더:', Object.fromEntries(response.headers.entries()));

    // 4) 백엔드 응답 처리
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // JSON이 아닌 경우 텍스트로 처리
      const textResponse = await response.text();
      console.log('백엔드에서 반환한 텍스트 응답:', textResponse);
      data = { message: textResponse };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || '폴더 생성 실패' },
        { status: response.status }
      );
    }

    // 성공 시 백엔드에서 받은 데이터 그대로 반환
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('폴더 생성 중 오류 발생:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
