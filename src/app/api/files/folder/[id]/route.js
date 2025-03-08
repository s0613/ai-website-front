import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 환경변수로 백엔드 도메인/포트 지정
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * GET /api/files/folder/[folderId]
 * -> Spring Boot: GET /api/files/folder/{folderId}
 */
export async function GET(
  request,
  { params }
) {
  try {
    const folderId = params.id;
    // cookies()를 await 키워드와 함께 사용
    const token = (await cookies()).get('auth-token')?.value;

    // JWT 토큰(쿠키)가 없는 경우 -> 401
    if (!token) {
      return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
    }

    // 백엔드에 요청
    const backendResponse = await fetch(`${BASE_URL}/api/files/folder/${folderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`,  // 스프링 쪽에서 쿠키 인증
      },
      credentials: 'include',  // 쿠키 전송
    });

    // 응답이 정상인지 확인
    if (!backendResponse.ok) {
      // 백엔드에서 에러 메시지를 받는 경우 처리
      let errorMsg = '';
      try {
        const errorData = await backendResponse.json();
        errorMsg = errorData?.message || '';
      } catch {}
      return NextResponse.json(
        { message: errorMsg || '파일 목록 조회 실패' },
        { status: backendResponse.status }
      );
    }

    // 정상 응답 시 JSON 데이터를 그대로 반환
    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('폴더 내 파일 목록 조회 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
