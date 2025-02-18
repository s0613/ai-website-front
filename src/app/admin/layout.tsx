"use client";
import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="min-h-screen flex">
            {/* 사이드바 예시 */}
            <aside className="w-64 bg-black text-white p-4">
                <nav>
                    <ul className="space-y-2">
                        <li className="text-lg font-semibold border-b border-gray-600 pb-2">어드민 메뉴</li>
                        <li><Link href="/admin">홈</Link></li>
                        <li><Link href="/admin/image">이미지 업로드</Link></li>
                        <li><Link href="/admin/blog">블로그 작성</Link></li>
                        <li><Link href="/admin/member">회원 확인</Link></li>
                    </ul>
                </nav>
            </aside>

            <main className="flex-1 p-8 bg-white">
                {children}
            </main>
        </section>
    );
}