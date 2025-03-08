import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // 백엔드에 인증 상태 확인 요청
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 쿠키 전달
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Backend authentication check failed');
      return NextResponse.json({ isAuthenticated: false }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json({
      isAuthenticated: true,
      email: data.email,
      role: data.role
    });
  } catch (error) {
    console.error('Error checking authentication:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 500 });
  }
}