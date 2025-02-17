"use client";
import React, { useState, useEffect } from 'react';
import BlogCard from './BlogCard';

const BlogList = () => {
    interface BlogPost {
        image: string;
        title: string;
        subtitle: string;
        author: string;
        date: string;
    }

    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        const fetchBlogPosts = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/blogs');
                if (!response.ok) {
                    throw new Error('Failed to fetch blog posts');
                }
                const data = await response.json();
                setBlogPosts(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchBlogPosts();
    }, []);

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">Our Blog</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {blogPosts.map((post, index) => (
                        <BlogCard
                            key={index}
                            image={post.image}
                            title={post.title}
                            subtitle={post.subtitle}
                            author={post.author}
                            date={post.date}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogList;