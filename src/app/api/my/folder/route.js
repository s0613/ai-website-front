import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 백엔드 API 기본 URL을 환경 변수에서 가져옵니다.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// GET - 폴더 목록 조회
export async function GET() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('ACCESS_TOKEN')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' }, 
        { status: 401 }
      );
    }

    const response = await fetch(`${BASE_URL}/api/folders`, {
      method: 'GET',
      headers: {
        'Cookie': `ACCESS_TOKEN=${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: '폴더 목록 조회 실패', error: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('폴더 목록 조회 에러:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST - 폴더 생성
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('ACCESS_TOKEN')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' }, 
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${BASE_URL}/api/folders`, {
      method: 'POST',
      headers: {
        'Cookie': `ACCESS_TOKEN=${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: '폴더 생성 실패', error: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('폴더 생성 에러:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}