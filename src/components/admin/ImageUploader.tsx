"use client";
import React, { useState } from 'react';

const ImageUploader = () => {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
    };

    const handleUpload = async () => {
        if (!file || !category) {
            alert('파일과 카테고리를 선택해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('images', file);
        formData.append('category', category);

        try {
            const res = await fetch('http://localhost:8080/api/images/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                alert('이미지 업로드 성공');
            } else {
                alert('업로드 실패');
            }
        } catch (error) {
            alert('에러 발생');
        }
    };

    return (
        <div className="border p-4 rounded">
            <input
                type="file"
                onChange={handleFileChange}
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