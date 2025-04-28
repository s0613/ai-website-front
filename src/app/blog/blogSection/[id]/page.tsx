// app/blog/blogSection/[id]/page.tsx
import { Metadata } from 'next';
import { getBlogById } from '@/features/blog/services/BlogService';
import BlogSection from '@/features/blog/BlogSection';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const blog = await getBlogById(params.id);
  return {
    title: blog.title,
    description: blog.subtitle,
  };
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const blog = await getBlogById(params.id);
  return <BlogSection initialBlog={blog} />;
}
