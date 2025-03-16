import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  
  try {
    // Spring Boot API에서 특정 비디오의 세부 정보 가져오기
    const backendResponse = await fetch(`${BASE_URL}/api/admin/videos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // 항상 최신 데이터를 가져옴
    });

    if (!backendResponse.ok) {
      // 백엔드 에러 상태 코드를 그대로 전달
      return NextResponse.json(
        { error: '비디오를 찾을 수 없습니다' },
        { status: backendResponse.status }
      );
    }

    const videoDetail = await backendResponse.json();
    return NextResponse.json(videoDetail);
  } catch (error) {
    console.error('비디오 상세 정보 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '비디오 상세 정보 조회 실패' },
      { status: 500 }
    );
  }
}
