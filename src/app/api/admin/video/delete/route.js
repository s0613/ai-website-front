import { NextResponse } from 'next/server';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export async function DELETE(request) {
  try {
    // URL에서 ID 추출 (예: /api/admin/video/delete?id=123)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '삭제할 비디오 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Spring Boot API로 삭제 요청
    const backendResponse = await fetch(`${BASE_URL}/api/admin/videos/${id}`, {
      method: 'DELETE',
    });

    if (!backendResponse.ok) {
      throw new Error('백엔드 API 호출 실패');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('비디오 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '비디오 삭제 실패' },
      { status: 500 }
    );
  }
}
