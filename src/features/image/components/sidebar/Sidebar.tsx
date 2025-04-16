"use client";

import { useState } from 'react';
import { FilterOptions } from '../../types/filter';

interface SidebarProps {
    onFilterChange: (filters: FilterOptions) => void;
}

export default function Sidebar({ onFilterChange }: SidebarProps) {
    const [filters, setFilters] = useState<FilterOptions>({
        search: '',
        categories: [],
        size: '모든 크기',
        sortBy: '최신순'
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFilters = { ...filters, search: e.target.value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleCategoryChange = (category: string) => {
        let newCategories: string[];
        if (category === '모든 이미지') {
            newCategories = [category];
        } else {
            const currentCategories = filters.categories.filter(c => c !== '모든 이미지');
            if (currentCategories.includes(category)) {
                newCategories = currentCategories.filter(c => c !== category);
            } else {
                newCategories = [...currentCategories, category];
            }
        }
        const newFilters = { ...filters, categories: newCategories };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSizeChange = (size: string) => {
        const newFilters = { ...filters, size };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSortChange = (sortBy: string) => {
        const newFilters = { ...filters, sortBy };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/20 p-4 overflow-y-auto">
            <div className="space-y-6">
                {/* 검색 */}
                <div>
                    <h3 className="text-white font-medium mb-2">검색</h3>
                    <input
                        type="text"
                        placeholder="이미지 검색..."
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-sky-500"
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* 카테고리 */}
                <div>
                    <h3 className="text-white font-medium mb-2">카테고리</h3>
                    <div className="space-y-2">
                        {['모든 이미지', '풍경', '인물', '동물', '사물'].map((category) => (
                            <label key={category} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                    className="form-checkbox text-sky-500 border-white/20 bg-white/10 rounded"
                                />
                                <span className="text-white">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 크기 */}
                <div>
                    <h3 className="text-white font-medium mb-2">크기</h3>
                    <select
                        value={filters.size}
                        onChange={(e) => handleSizeChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-sky-500"
                    >
                        <option value="모든 크기">모든 크기</option>
                        <option value="작은 크기">작은 크기</option>
                        <option value="중간 크기">중간 크기</option>
                        <option value="큰 크기">큰 크기</option>
                    </select>
                </div>

                {/* 정렬 */}
                <div>
                    <h3 className="text-white font-medium mb-2">정렬</h3>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-sky-500"
                    >
                        <option value="최신순">최신순</option>
                        <option value="오래된순">오래된순</option>
                    </select>
                </div>
            </div>
        </div>
    );
} 