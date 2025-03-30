"use client";
import type React from "react";
import { useState } from "react";
import { Loader2, Upload, AlertCircle } from "lucide-react";
// BlogService에서 createBlog 가져오기
import { createBlog } from "./services/BlogService";
import { Blog } from "./types/Blog";

const BlogForm = () => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Handle image selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = "제목을 입력해주세요";
    if (!subtitle.trim()) newErrors.subtitle = "부제목을 입력해주세요";
    if (!author.trim()) newErrors.author = "작성자를 입력해주세요";
    if (!content.trim()) newErrors.content = "내용을 입력해주세요";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Blog 객체 생성
      const blogData: Blog = {
        title,
        subtitle,
        author,
        content,
      };

      // BlogService의 createBlog 함수 직접 호출
      await createBlog(blogData, image || undefined);

      setSubmitStatus({
        type: "success",
        message: "블로그 글이 성공적으로 등록되었습니다!",
      });

      // Reset form
      setTitle("");
      setSubtitle("");
      setAuthor("");
      setContent("");
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("블로그 등록 오류:", error);
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "블로그 글 등록에 실패했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          새 블로그 글 작성
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          모든 필드를 작성하여 새로운 블로그 글을 등록하세요.
        </p>
      </div>

      {submitStatus.type && (
        <div
          className={`mx-6 mt-4 px-4 py-3 rounded-md ${
            submitStatus.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {submitStatus.type === "success" ? (
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{submitStatus.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.title
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-sky-500"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
            placeholder="블로그 글의 제목을 입력하세요"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="subtitle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            부제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.subtitle
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-sky-500"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
            placeholder="블로그 글의 부제목을 입력하세요"
          />
          {errors.subtitle && (
            <p className="mt-1 text-sm text-red-600">{errors.subtitle}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="author"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            작성자 <span className="text-red-500">*</span>
          </label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={`w-full px-3 py-2 border ${
              errors.author
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-sky-500"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
            placeholder="작성자 이름을 입력하세요"
          />
          {errors.author && (
            <p className="mt-1 text-sm text-red-600">{errors.author}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            내용 <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 font-normal ml-1">
              (마크다운 형식 지원)
            </span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={`w-full px-3 py-2 border ${
              errors.content
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-sky-500"
            } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors font-mono text-sm`}
            placeholder="# 마크다운 형식으로 내용을 작성하세요"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            마크다운 문법을 사용하여 서식을 적용할 수 있습니다. (예: # 제목,
            **굵게**, *기울임*, [링크](URL))
          </p>
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            대표 이미지
          </label>
          <div className="mt-1 flex items-center">
            <label className="relative flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-sky-400 focus:outline-none">
              <span className="flex flex-col items-center space-y-2">
                {imagePreview ? (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-full max-h-28 object-contain"
                  />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      이미지를 선택하거나 여기에 드래그하세요
                    </span>
                  </>
                )}
              </span>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            권장 크기: 1200 x 630 픽셀 (16:9 비율)
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            } transition-colors duration-200`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                처리 중...
              </>
            ) : (
              "블로그 글 등록하기"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
