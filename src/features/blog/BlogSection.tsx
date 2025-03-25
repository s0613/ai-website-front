"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Calendar, User, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16">
        <Loader2 className="h-12 w-12 text-sky-400 animate-spin mb-4" />
        <p className="text-gray-600">블로그 콘텐츠를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            오류가 발생했습니다
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            블로그 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            콘텐츠를 찾을 수 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            요청하신 블로그 게시물이 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            블로그 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-600 hover:text-sky-600 mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>모든 블로그 글</span>
        </Link>

        <article>
          <div className="relative mb-8 rounded-xl overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
            <img
              src={blog.image || "/placeholder.svg"}
              alt={blog.title}
              className="w-full h-[400px] object-cover"
            />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              {blog.title}
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed">
              {blog.subtitle}
            </h2>

            <div className="flex items-center text-sm text-gray-500 border-t border-b border-gray-200 py-4">
              <div className="flex items-center mr-6">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>{blog.date}</span>
              </div>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </section>
  );
};

export default BlogSection;
