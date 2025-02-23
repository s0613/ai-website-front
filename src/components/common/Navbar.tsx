"use client";
import React, { useState } from 'react';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isLoggedIn, email } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* 로고 */}
                <Link href="/" className="text-2xl font-bold text-gray-800">
                    Crazy Space
                </Link>
                {/* 검색창 */}
                <div className="flex-1 mx-4 relative">
                    <input
                        type="text"
                        placeholder="사진과 일러스트 검색"
                        className="w-full h-10 border border-gray-300 rounded-full pl-10 pr-4 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
                {/* 내비게이션 링크 */}
                <nav className="hidden md:flex space-x-8 text-gray-600">
                    <a href="/blog/blogList" className="hover:text-gray-900">블로그</a>
                    <a href="/contact" className="hover:text-gray-900">광고</a>
                    {isLoggedIn ? (
                        <span className="text-gray-800">{email}</span>
                    ) : (
                        <>
                            <a href="/login" className="hover:text-gray-900">로그인</a>
                            <a href="/signup" className="hover:text-gray-900">회원가입</a>
                        </>
                    )}
                </nav>
                {/* 모바일 메뉴 버튼 */}
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-gray-800 focus:outline-none">
                        {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                    </button>
                </div>
            </div>
            {/* 모바일 메뉴 */}
            {isMenuOpen && (
                <div className="md:hidden px-4 pb-4">
                    <a href="/blog" className="block py-2 text-gray-600 hover:text-gray-900">블로그</a>
                    <a href="/contact" className="block py-2 text-gray-600 hover:text-gray-900">광고</a>
                    {isLoggedIn ? (
                        <span className="block py-2 text-gray-800">{email}</span>
                    ) : (
                        <>
                            <a href="/login" className="block py-2 text-gray-600 hover:text-gray-900">로그인</a>
                            <a href="/signup" className="block py-2 text-gray-600 hover:text-gray-900">회원가입</a>
                        </>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;