"use client";
import React, { useState } from 'react';

const BlogForm = () => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [author, setAuthor] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('subtitle', subtitle);
            formData.append('author', author);
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            // 실제 서버 API로 전송 (예: /api/blog)
            const res = await fetch('/api/blog', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                alert('블로그 글이 등록되었습니다!');
                setTitle('');
                setSubtitle('');
                setAuthor('');
                setContent('');
                setImage(null);
            } else {
                alert('등록 실패');
            }
        } catch {
            alert('에러 발생');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
            <div>
                <label className="block mb-1 font-semibold">제목</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>
            <div>
                <label className="block mb-1 font-semibold">부제목</label>
                <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>
            <div>
                <label className="block mb-1 font-semibold">작성자</label>
                <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>
            <div>
                <label className="block mb-1 font-semibold">내용</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>
            <div>
                <label className="block mb-1 font-semibold">이미지 파일</label>
                <input
                    type="file"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="w-full border rounded px-2 py-1"
                />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">등록</button>
        </form>
    );
};

export default BlogForm;