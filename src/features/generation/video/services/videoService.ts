// services/videoService.ts

// 영상 생성, 저장, 업스케일링 API 호출 및 파일을 Base64로 변환하는 유틸리티 함수 모음

/**
 * 영상 생성 API 호출
 * @param payload 영상 생성에 필요한 데이터
 * @param endpoint API 엔드포인트
 * @returns API 응답 결과(JSON)
 */
export async function generateVideo(
  payload: any,
  endpoint: string
): Promise<any> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "영상 생성 실패");
  }
  return await res.json();
}

/**
 * 생성된 영상을 서버에 저장하는 API 호출
 * @param videoUrl 생성된 영상 URL
 * @param data 영상 생성 요청 시 사용한 데이터
 * @returns API 응답 결과(JSON)
 */
export async function saveVideo(
  videoUrl: string,
  data: any
): Promise<any> {
  const res = await fetch("/api/my/creation/video/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      videoUrl: videoUrl,
      data: {
        prompt: data.prompt,
        endpoint: data.endpoint,
        fileUrl: data.fileUrl,
        imageFile: data.imageFile ? true : false,
      },
    }),
  });

  if (!res.ok) {
    let errorMsg = "비디오 저장에 실패했습니다.";
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      errorMsg = `서버 오류: ${res.status} ${res.statusText}`;
    }
    throw new Error(errorMsg);
  }
  return await res.json();
}

/**
 * 업스케일링 API 호출
 * @param videoUrl 업스케일링할 영상 URL
 * @returns API 응답 결과(JSON)
 */
export async function upscaleVideo(videoUrl: string): Promise<any> {
  const response = await fetch("/api/video/upscaler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || "업스케일링 처리 중 오류가 발생했습니다"
    );
  }
  return await response.json();
}

/**
 * File 객체를 Base64 문자열로 변환
 * @param file 변환할 File 객체
 * @returns Base64 문자열
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("파일 읽기 오류"));
      }
    };
    reader.onerror = () => reject(new Error("파일 읽기 오류"));
  });
}
