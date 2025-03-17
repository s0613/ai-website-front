// components/blog/BlogList.tsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import BlogCard from "./BlogCard";

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
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-500">오류: {error}</div>;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">블로그</h1>
        <div className="grid grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            // === 핵심 수정 ===
            // /api/...가 아니라, /blog/blogSection/[id]로 이동하도록
            <Link key={post.id} href={`/blog/blogSection/${post.id}`}>
              <BlogCard
                image={post.image}
                title={post.title}
                subtitle={post.subtitle}
                author={post.author}
                date={post.date}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogList;
