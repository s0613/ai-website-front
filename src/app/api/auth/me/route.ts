import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

    // 1) 클라이언트 요청에서 쿠키를 추출
    const cookieHeader = request.headers.get('cookie') || '';

    // 쿠키가 없는 경우
    if (!cookieHeader) {
      console.error('쿠키가 존재하지 않습니다.');
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    console.log("전달되는 전체 쿠키 헤더:", cookieHeader);

    // 2) 백엔드 요청 시, 추출한 쿠키를 헤더에 그대로 실어서 전달
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,         // ★ 쿠키 전달
      },
      credentials: 'include',           // ★ 쿠키 포함 여부
    });

    // 3) 백엔드에서 응답 실패
    if (!response.ok) {
      console.error('Backend authentication check failed', response.status);
      return NextResponse.json({ isAuthenticated: false }, { status: response.status });
    }

    // 4) 정상 응답
    const data = await response.json();
    return NextResponse.json({
      isAuthenticated: true,
      email: data.email,
      role: data.role,
      nickname: data.nickname
    });
  } catch (error) {
    console.error('Error checking authentication:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 500 });
  }
}
