import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 백엔드 URL 환경변수
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * 폴더 목록 조회 API 핸들러
 * - 스프링부트의 /api/folders GET 엔드포인트와 통신
 */
export async function GET() {
  try {
    // 1) 쿠키에서 JWT 토큰 확인
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    // 토큰이 없으면 401 Unauthorized 반환
    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 2) 백엔드 API 호출
    const response = await fetch(`${BASE_URL}/api/folders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`,
      },
      credentials: 'include',
    });

    // 3) 응답 처리
    if (!response.ok) {
      const errorData = await response.text();
      console.error('백엔드 에러 응답:', errorData);
      
      return NextResponse.json(
        { message: '폴더 목록 조회 실패' },
        { status: response.status }
      );
    }

    // 4) 성공 시 데이터 반환
    const folders = await response.json();
    return NextResponse.json(folders, { status: 200 });

  } catch (error) {
    console.error('폴더 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}