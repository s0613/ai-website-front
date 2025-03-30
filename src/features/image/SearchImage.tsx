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
    width: number;
    height: number;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="relative bg-gray-200 rounded-lg overflow-hidden"
                style={{
                  gridRowEnd: `span ${Math.ceil((result.height / result.width) * 10)}`,
                }}
              >
                <img
                  src={result.url}
                  alt={result.name}
                  className="w-full h-full object-cover rounded-lg transition-all duration-300 ease-in-out"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out">
                  <p className="text-white font-semibold">{result.name}</p>
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
