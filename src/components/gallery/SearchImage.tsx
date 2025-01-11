"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const SearchImage = () => {
    const searchParams = useSearchParams();
    const query = searchParams ? searchParams.get('query') : '';
    interface ImageResult {
        url: string;
        name: string;
    }

    const [searchResults, setSearchResults] = useState<ImageResult[]>([]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/images/search?imageName=${query}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch images');
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error(error);
            }
        };

        if (query) {
            fetchSearchResults();
        }
    }, [query]);

    return (
        <section className="px-4 pt-6 pb-12 bg-white text-black md:px-16 md:pt-12 md:pb-14">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">검색 결과</h1>
                {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {searchResults.map((result, index) => (
                            <div key={index} className="bg-gray-200 rounded-lg overflow-hidden">
                                <img src={result.url} alt={result.name} className="w-full h-auto object-cover" />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">{result.name}</h3>
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