// components/blog/BlogList.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import BlogCard from "./BlogCard";

// 애니메이션 효과
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.2 },
};

interface BlogPost {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
}

const BlogList = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch("/api/admin/blog/blogList");
        if (!response.ok) {
          throw new Error("블로그 데이터를 가져오는 데 실패했습니다.");
        }
        const data = await response.json();
        setBlogPosts(data);
      } catch (err) {
        console.error(err);
        setError("오류 발생");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (loading) {
    return (
      <motion.div
        {...fadeIn}
        className="py-32 flex justify-center items-center bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200"
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-medium">
            콘텐츠를 불러오는 중...
          </p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        {...fadeIn}
        className="py-32 flex justify-center items-center bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200"
      >
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-200 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            오류가 발생했습니다
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.section
      {...fadeIn}
      className="py-20 md:py-28 px-4 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            {...fadeIn}
            className="inline-block mb-5 px-5 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm font-medium backdrop-blur-sm border border-gray-200/50"
          >
            지식의 공유
          </motion.div>
          <motion.h1
            {...fadeIn}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-8"
          >
            AI 영상 제작의 <span className="text-sky-500">인사이트</span>
          </motion.h1>
          <motion.p
            {...fadeIn}
            className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
          >
            창의적인 콘텐츠 제작의 세계를 탐험하고 전문가들의 노하우를
            배워보세요.
          </motion.p>
        </div>

        <motion.div
          {...fadeIn}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              {...fadeIn}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Link
                href={`/blog/blogSection/${post.id}`}
                className="block h-full"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-200 h-full group">
                  <div className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -translate-y-8 translate-x-8 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-700 ease-in-out z-0"></div>
                    {post.image && (
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-6 relative">
                    <div className="flex items-center mb-3">
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-sky-500"
                      >
                        <BookOpen className="w-5 h-5" />
                      </motion.div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.subtitle}
                    </p>
                    <div className="flex justify-between items-center text-sm mt-auto pt-4 border-t border-gray-100">
                      <span className="text-gray-700 font-medium">
                        {post.author}
                      </span>
                      <span className="text-gray-500">{post.date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {blogPosts.length === 0 && (
          <motion.div {...fadeIn} className="text-center py-12">
            <p className="text-gray-600">작성된 블로그 포스트가 없습니다.</p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default BlogList;
