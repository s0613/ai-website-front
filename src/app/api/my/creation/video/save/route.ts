import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 요청에서 필요한 정보 추출
    const body = await req.json();
    const { videoUrl, data } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { message: "비디오 URL이 필요합니다." },
        { status: 400 }
      );
    }

    // 비디오 URL에서 파일 다운로드
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      return NextResponse.json(
        { message: "비디오 다운로드에 실패했습니다." },
        { status: 500 }
      );
    }

    // 다운로드한 비디오 데이터를 Blob으로 변환
    const videoBlob = await videoResponse.blob();

    // 프론트 측에서 받은 파일/URL 정보를 기반으로 mode 결정
    let finalMode = "TEXT_TO_VIDEO"; // 기본값
    if (data.imageFile) {
      finalMode = "IMAGE_TO_VIDEO";
    } else if (data.fileUrl) {
      finalMode = "VIDEO_TO_VIDEO";
    }

    // 파일 이름 생성
    const fileName = `video_${Date.now()}.mp4`;

    // FormData 생성
    const formData = new FormData();
    
    // 비디오 파일 추가
    formData.append(
      "videoFile",
      new Blob([videoBlob], { type: "video/mp4" }),
      fileName
    );

    // 참조 이미지가 있는 경우, 참조 이미지도 추가
    if (data.fileUrl && finalMode === "IMAGE_TO_VIDEO") {
      try {
        const refResponse = await fetch(data.fileUrl);
        if (refResponse.ok) {
          const refBlob = await refResponse.blob();
          // 파일명 추출 또는 생성
          const refFileName = data.fileUrl.split('/').pop() || `reference_${Date.now()}.jpg`;
          formData.append("referenceFile", refBlob, refFileName);
        }
      } catch (error) {
        console.error("참조 이미지 추가 실패:", error);
      }
    }

    // 서버에서 요구하는 DTO에 맞춰 JSON 생성
    const requestData = {
      videoName: fileName,         // AIVideoName에서 videoName으로 변경
      prompt: data.prompt,
      model: data.endpoint,
      mode: finalMode,
    };

    // JSON을 FormData에 추가
    formData.append(
      "data",
      new Blob([JSON.stringify(requestData)], {
        type: "application/json",
      })
    );

    // 비디오 저장 API(Spring Boot) 호출
    const saveResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/my/videos`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      return NextResponse.json(
        { message: errorData.message || "비디오 저장에 실패했습니다." },
        { status: saveResponse.status }
      );
    }

    // 저장된 비디오 데이터
    const savedVideo = await saveResponse.json();

    // 성공 응답 반환
    return NextResponse.json({ success: true, video: savedVideo });
  } catch (error) {
    console.error("비디오 저장 API 오류:", error);
    return NextResponse.json(
      { message: error.message || "비디오 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
