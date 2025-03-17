// components/blog/BlogSection.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface Blog {
  title: string;
  subtitle: string;
  author: string;
  content: string; // Markdown
  image: string;
  date: string;
}

const BlogSection: React.FC = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("블로그 id가 제공되지 않았습니다.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/blog/blogSection/${id}`);
        if (!res.ok) {
          throw new Error("블로그 데이터를 가져오는 데 실패했습니다.");
        }
        const data: Blog = await res.json();
        setBlog(data);
      } catch {
        setError("오류 발생");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="text-red-500">오류: {error}</div>;
  if (!blog) return <div>데이터가 없습니다.</div>;

  return (
    <section className="blog-section py-8">
      <article className="max-w-3xl mx-auto">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-96 object-cover mb-6 rounded"
        />
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        <h2 className="text-2xl text-gray-600 mb-4">{blog.subtitle}</h2>
        <div className="text-sm text-gray-500 mb-6">
          <span>By {blog.author}</span> | <span>{blog.date}</span>
        </div>
        <div className="prose max-w-none">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>
      </article>
    </section>
  );
};

export default BlogSection;
