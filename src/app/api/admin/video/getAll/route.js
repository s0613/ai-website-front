import { NextResponse } from 'next/server';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export async function GET() {
  try {
    // Spring Boot API에서 모든 비디오 목록 가져오기
    const backendResponse = await fetch(`${BASE_URL}/api/admin/videos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // 항상 최신 데이터를 가져옴
    });

    if (!backendResponse.ok) {
      throw new Error('백엔드 API 호출 실패');
    }

    const videos = await backendResponse.json();
    return NextResponse.json(videos);
  } catch (error) {
    console.error('비디오 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '비디오 목록 조회 실패' },
      { status: 500 }
    );
  }
}
