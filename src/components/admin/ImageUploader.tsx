"use client";
import React, { useState } from "react";

const ImageUploader = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files); // 여러 파일을 배열로 변환
            setFiles(selectedFiles);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
    };

    const handleUpload = async () => {
        if (files.length === 0 || !category) {
            alert("파일과 카테고리를 선택해주세요.");
            return;
        }

        const formData = new FormData();
        files.forEach((file) => formData.append("images", file)); // 여러 파일 추가
        formData.append("category", category);

        setIsLoading(true); // 로딩 상태 시작
        try {
            // 요청 보내기 전에 로그 추가
            console.log("파일 업로드 요청 보내기:", {
                files: files.map((file) => file.name),
                category: category,
            });

            // ★ 스프링부트 서버로 요청 보내기 ★
            const res = await fetch("http://localhost:8080/api/images/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                alert("이미지 업로드 성공");
                setFiles([]); // 업로드 성공 시 파일 목록 초기화
                setCategory(""); // 업로드 성공 시 카테고리 초기화
            } else {
                alert("업로드 실패");
            }
        } catch (error) {
            alert("에러 발생");
            console.error("업로드 중 에러 발생:", error);
        } finally {
            setIsLoading(false); // 로딩 상태 종료
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

            {/* 파일 입력 및 카테고리 선택 */}
            <input
                type="file"
                onChange={handleFileChange}
                multiple // 여러 파일 선택 가능
                className="block mb-2"
            />
            <select
                value={category}
                onChange={handleCategoryChange}
                className="block mb-2"
            >
                <option value="">카테고리를 선택하세요</option>
                <option value="REALITY">AI 현실적 이미지</option>
                <option value="ILLUSTRATION">AI 일러스트 이미지</option>
                <option value="VIDEO">AI 영상</option>
                <option value="ETC">기타</option>
            </select>
            <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                업로드
            </button>
        </div>
    );
};

export default ImageUploader;
