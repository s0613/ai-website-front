"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { FaCamera } from "react-icons/fa";

type CategoryItem = {
    title: string;
    subtitle: string;
};

const CategoryBox = ({ items, onSelect }: { items: CategoryItem[], onSelect: (item: CategoryItem) => void }) => {
    return (
        <div className="p-4 rounded-md border border-gray-300 flex flex-col justify-between h-full w-full md:w-10/12">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                    onClick={() => onSelect(item)}
                >
                    <h2 className="text-lg font-semibold text-gray-800 hover:text-gray-500">{item.title}</h2>
                    <p className="text-sm text-gray-600 hover:text-gray-400">{item.subtitle}</p>
                </div>
            ))}
        </div>
    );
};

const HeroSection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        router.push(`/gallery/search?query=${searchTerm}`);
    };

    const handleCategorySelect = (item: CategoryItem) => {
        setSearchTerm(item.title);
        router.push(`/gallery/search?category=${item.title}`);
    };

    const categoryItems = [
        { title: "AI 현실적 이미지", subtitle: "더 현실적으로, 현실보다 더 현실같게" },
        { title: "AI 일러스트 이미지", subtitle: "아름답게 만들어진 일러스트를 만나기 위해서" },
        { title: "AI 영상", subtitle: "위대한 여정의 시작 AI영상" },
        { title: "기타", subtitle: "원하는 것을 무한대로 찾아보기" },
    ];

    return (
        <section className="px-4 pt-6 pb-12 bg-white text-black md:px-16 md:pt-12 md:pb-14">
            <div className="flex flex-col md:flex-row items-center justify-center md:items-start">

                {/* 데스크톱(PC) 전용 영역: md 이상에서 보이도록 설정 */}
                <div className="hidden md:flex flex-1 flex-col justify-between text-center md:text-left mb-6 md:mb-0">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mt-8 md:mt-16 mb-4 leading-tight">
                            진짜 감각, RealFeel
                        </h1>
                        <p className="text-base md:text-lg font-light text-gray-700 mb-6 leading-relaxed">
                            박승호의 스튜디오에 오신 것을 환영합니다.
                            <br />
                            모든 AI 이미지는 제가 만들었습니다.
                        </p>
                        {/* 검색창 */}
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="사진과 일러스트 검색"
                                className="w-full h-14 border border-gray-300 rounded-md px-4 pl-10 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <FaCamera className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        </form>
                    </div>
                </div>

                {/* 공통 Category Box 영역 */}
                <div className="flex-1 flex justify-center items-center">
                    <CategoryBox items={categoryItems} onSelect={handleCategorySelect} />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;