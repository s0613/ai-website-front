"use client";

import { useState } from "react";

interface SidebarProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  search: string;
  categories: string[];
  duration: string;
  sortBy: string;
}

// 사이드바 카테고리 데이터
const categories = [
  "모든 비디오",
  "자연",
  "도시",
  "추상",
  "항공",
  "시네마틱",
  "슬로우 모션",
  "다큐멘터리",
  "실험적",
];

const durations = ["모든 길이", "짧은 영상", "중간 길이", "긴 영상"];
const sortOptions = ["최신순", "인기순", "오래된순"];

export default function Sidebar({ onFilterChange }: SidebarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    categories: [],
    duration: "모든 길이",
    sortBy: "최신순",
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDurationChange = (duration: string) => {
    const newFilters = { ...filters, duration };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div
      className={`bg-white h-full ${
        isCollapsed ? "w-16" : "w-64"
      } flex flex-col border-r border-gray-200 transition-all duration-300`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-xl font-semibold">필터</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="비디오 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={handleSearchChange}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full text-left font-medium mb-2"
              onClick={() => toggleSection("categories")}
            >
              <span>카테고리</span>
              <svg
                className={`h-5 w-5 transition-transform ${
                  activeSection === "categories" ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {activeSection === "categories" && (
              <div className="space-y-2 ml-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={category}
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor={category}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Duration Section */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full text-left font-medium mb-2"
              onClick={() => toggleSection("duration")}
            >
              <span>영상 길이</span>
              <svg
                className={`h-5 w-5 transition-transform ${
                  activeSection === "duration" ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {activeSection === "duration" && (
              <div className="space-y-2 ml-2">
                {durations.map((duration) => (
                  <div key={duration} className="flex items-center">
                    <input
                      type="radio"
                      id={duration}
                      name="duration"
                      checked={filters.duration === duration}
                      onChange={() => handleDurationChange(duration)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={duration}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {duration}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort By Section */}
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full text-left font-medium mb-2"
              onClick={() => toggleSection("sortBy")}
            >
              <span>정렬 기준</span>
              <svg
                className={`h-5 w-5 transition-transform ${
                  activeSection === "sortBy" ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {activeSection === "sortBy" && (
              <div className="space-y-2 ml-2">
                {sortOptions.map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="radio"
                      id={option}
                      name="sortBy"
                      checked={filters.sortBy === option}
                      onChange={() => handleSortChange(option)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={option}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
