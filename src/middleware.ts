import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // admin 페이지 경로 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const userRole = request.cookies.get('userRole')?.value

    console.log(`userRole with brackets: [${userRole}]`)
    console.log("length:", userRole?.length)

    // 타입스크립트 오류 수정: userRole이 undefined일 수 있으므로 옵셔널 체이닝 사용
    if (userRole) {
      for (let i = 0; i < userRole.length; i++) {
        console.log(`char at ${i}:`, userRole[i], userRole.charCodeAt(i))
      }
    }

    // ADMIN 역할이 아닌 경우 /unauthorized 로 리다이렉트
    // 대소문자 구분 없이 'admin' 또는 'ADMIN' 모두 허용
    const normalizedRole = userRole?.trim().toLowerCase() || '';
    console.log('Normalized role:', normalizedRole);

    if (normalizedRole !== 'admin') {
      console.log('권한 없음: 리다이렉트 실행');
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    console.log('권한 확인 완료: admin 페이지 접근 허용');
  }

  // my 페이지 경로 체크 - 로그인 필요
  if (request.nextUrl.pathname.startsWith('/my')) {
    // auth-token 쿠키 확인하여 로그인 상태 체크
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('마이페이지 접근 시도:', request.nextUrl.pathname);
    console.log('인증 토큰 확인:', token ? '존재함' : '없음');
    
    if (!token) {
      console.log('로그인이 필요합니다: 로그인 페이지로 리다이렉트');
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    console.log('로그인 확인 완료: 마이페이지 접근 허용');
  }

  // video API 경로 체크
  if (request.nextUrl.pathname.startsWith('/api/video')) {
    const userRole = request.cookies.get('userRole')?.value?.trim().toUpperCase() || '';
    const allowedRoles = ['BEGINNER', 'BASIC', 'PREMIUM', 'ADMIN'];

    if (!allowedRoles.includes(userRole)) {
      console.log('비디오 API 접근 권한 없음:', userRole);
      return new NextResponse(
        JSON.stringify({ error: '접근 권한이 없습니다.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('비디오 API 접근 권한 확인 완료:', userRole);
  }

  return NextResponse.next()
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: ['/admin/:path*', '/my/:path*', '/api/video/:path*']
}
