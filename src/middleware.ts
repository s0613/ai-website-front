import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // admin 페이지 경로 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const userRole = request.cookies.get('userRole')?.value

    // ADMIN 역할이 아닌 경우 /unauthorized 로 리다이렉트
    // 대소문자 구분 없이 'admin' 또는 'ADMIN' 모두 허용
    const normalizedRole = userRole?.trim().toLowerCase() || '';

    if (normalizedRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // my 페이지 경로 체크 - 로그인 필요
  if (request.nextUrl.pathname.startsWith('/my')) {
    // auth-token 쿠키 확인하여 로그인 상태 체크
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // video API 경로 체크
  if (request.nextUrl.pathname.startsWith('/api/video')) {
    const userRole = request.cookies.get('userRole')?.value?.trim().toUpperCase() || '';
    const allowedRoles = ['BEGINNER', 'BASIC', 'PREMIUM', 'ADMIN'];

    if (!allowedRoles.includes(userRole)) {
      return new NextResponse(
        JSON.stringify({ error: '접근 권한이 없습니다.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return NextResponse.next()
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: ['/admin/:path*', '/my/:path*', '/api/video/:path*']
}
