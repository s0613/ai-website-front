// app/blog/blogSection/[id]/page.tsx
import BlogSection from "@/features/blog/BlogSection";

interface PageProps {
  params: {
    id: string;
  };
}

export default function BlogDetailPage({}: PageProps) {
  // id prop 전달 없이 BlogSection만 렌더링
  return <BlogSection />;
}
