'use client';

import React, { useState } from 'react';

export default function ImageUploader() {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('image', file);

            // 예시로 /api/upload 경로로 요청
            const res = await fetch('/api/images/upload', {
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
            <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                업로드
            </button>
        </div>
    );
}
