import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * POST /api/files/upload/[folderId]
 * -> Spring Boot: POST /api/files/upload/{folderId} (multipart/form-data)
 */
export async function POST(
  request,
  { params }
) {
  try {
    const folderId = params.id;
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    // 인증 쿠키가 없으면 401
    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // Next.js Route Handler에서 multipart/form-data 추출:
    // formData()를 호출하면, 파일을 포함한 데이터가 파싱됩니다.
    const formData = await request.formData();

    // 백엔드에 그대로 전송 (headers에 'Content-Type'을 직접 지정하지 않는 게 중요)
    const backendResponse = await fetch(`${BASE_URL}/api/files/upload/${folderId}`, {
      method: 'POST',
      headers: {
        // multipart/form-data 헤더는 fetch가 자동으로 boundary를 설정하므로 직접 지정하지 않는 것이 안전
        'Cookie': `auth-token=${token}`, 
      },
      credentials: 'include',
      body: formData,
    });

    if (!backendResponse.ok) {
      let errorMsg = '';
      try {
        const errorData = await backendResponse.json();
        errorMsg = errorData?.message || '';
      } catch {}
      return NextResponse.json(
        { message: errorMsg || '파일 업로드 실패' },
        { status: backendResponse.status }
      );
    }

    // 업로드 성공 시 응답(JSON)을 그대로 반환
    const resultData = await backendResponse.json();
    return NextResponse.json(resultData, { status: 200 });

  } catch (error) {
    console.error('파일 업로드 중 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
