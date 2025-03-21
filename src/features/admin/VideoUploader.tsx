"use client";
import React, { useState } from "react";

const VideoUploader = () => {
  const [aiVideo, setAiVideo] = useState<File | null>(null);
  const [aiVideoName, setAiVideoName] = useState("");
  const [modeFile, setModeFile] = useState<File | null>(null); // 추가 파일 (이미지/영상)
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("veo2"); // 기본 모델 설정
  const [isLoading, setIsLoading] = useState(false);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // 비디오 파일 타입 확인
      if (selectedFile.type.startsWith("video/")) {
        setAiVideo(selectedFile);
      } else {
        alert("비디오 파일만 업로드할 수 있습니다.");
      }
    }
  };

  const handleModeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setModeFile(e.target.files[0]);
    }
  };

  const handleVideoNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAiVideoName(e.target.value);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  const handleUpload = async () => {
    if (!aiVideo || !aiVideoName || !prompt) {
      alert("영상 파일, 영상 이름, 프롬프트를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // FormData 객체 생성
      const formData = new FormData();

      // 비디오 파일 추가
      formData.append("videoFile", aiVideo);

      // 추가 파일이 있는 경우 추가
      if (modeFile) {
        formData.append("modeFile", modeFile);
      }

      // JSON 데이터 구성
      const jsonData = {
        prompt: prompt,
        endpoint: model,
        videoName: aiVideoName,
      };

      // JSON 데이터를 FormData에 추가
      formData.append("data", JSON.stringify(jsonData));

      console.log("영상 저장 요청 보내기");

      // FormData로 요청 전송
      const res = await fetch("/api/my/creation/video/save", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        alert("영상 업로드 성공");
        setAiVideo(null);
        setAiVideoName("");
        setPrompt("");
        setModeFile(null);
        console.log("저장된 영상 정보:", result);
      } else {
        const errorData = await res.json();
        alert(`업로드 실패: ${errorData.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      alert("에러 발생");
      console.error("업로드 중 에러 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded relative">
      {/* 로딩 팝업 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-center text-lg font-semibold">업로드 중...</p>
            <div className="mt-4 flex justify-center">
              <div className="loader w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">영상 파일</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          className="block w-full"
        />
        {aiVideo && (
          <p className="mt-1 text-sm text-gray-500">
            선택된 파일: {aiVideo.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          추가 파일 (선택사항)
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleModeFileChange}
          className="block w-full"
        />
        {modeFile && (
          <p className="mt-1 text-sm text-gray-500">
            선택된 파일: {modeFile.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">영상 이름</label>
        <input
          type="text"
          value={aiVideoName}
          onChange={handleVideoNameChange}
          className="block w-full border rounded p-2"
          placeholder="영상 이름을 입력하세요"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">모델</label>
        <select
          value={model}
          onChange={handleModelChange}
          className="block w-full border rounded p-2"
        >
          <option value="veo2">Veo2</option>
          <option value="luna">Luna</option>
          <option value="kling">Kling</option>
          <option value="wan">Wan</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">프롬프트</label>
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          className="block w-full border rounded p-2 h-32"
          placeholder="영상 생성에 사용된 프롬프트를 입력하세요"
        />
      </div>

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        업로드
      </button>
    </div>
  );
};

export default VideoUploader;
