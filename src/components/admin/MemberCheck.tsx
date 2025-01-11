'use client';

import React, { useState } from 'react';

export default function MemberCheck() {
    const [email, setEmail] = useState('');
    const [memberStatus, setMemberStatus] = useState<string | null>(null);

    const handleCheck = async () => {
        try {
            // 실제 서버 API로 회원 확인 요청 (예: /api/check-member)
            const res = await fetch(`/api/check-member?email=${email}`, {
                method: 'GET',
            });
            if (res.ok) {
                const data = await res.json();
                setMemberStatus(data.isMember ? '회원' : '비회원');
            } else {
                setMemberStatus('조회 실패');
            }
        } catch (error) {
            setMemberStatus('에러 발생');
        }
    };

    return (
        <div className="border p-4 rounded">
            <label className="block mb-1 font-semibold">이메일</label>
            <input
                type="email"
                className="w-full border rounded px-2 py-1 mb-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button
                onClick={handleCheck}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                회원 확인
            </button>
            {memberStatus && (
                <p className="mt-2">
                    확인 결과: <strong>{memberStatus}</strong>
                </p>
            )}
        </div>
    );
}
