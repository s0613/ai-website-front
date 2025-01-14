"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const SearchImage = () => {
    const searchParams = useSearchParams();
    const query = searchParams ? searchParams.get("query") : "";
    const category = searchParams ? searchParams.get("category") : "";

    interface SearchResult {
        url: string;
        name: string;
    }

    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    useEffect(() => {
        const fetchSearchResults = async () => {
            setIsLoading(true); // 로딩 시작
            try {
                let apiUrl = "http://localhost:8080/api/images/search";
                if (query) {
                    apiUrl += `?imageName=${query}`;
                } else if (category) {
                    apiUrl += `?category=${category}`;
                }

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error("Failed to fetch images");
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setIsLoading(false); // 로딩 종료
            }
        };

        if (query || category) {
            fetchSearchResults();
        }
    }, [query, category]);

    return (
        <section className="px-4 pt-6 pb-12 bg-white text-black md:px-16 md:pt-12 md:pb-14">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">검색 결과</h1>
                {isLoading ? (
                    <p>로딩 중...</p>
                ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                className="bg-gray-200 rounded-lg overflow-hidden"
                            >
                                <img
                                    src={result.url}
                                    alt={result.name}
                                    className="w-full h-auto object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">
                                        {result.name}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>검색 결과가 없습니다.</p>
                )}
            </div>
        </section>
    );
};

export default SearchImage;
