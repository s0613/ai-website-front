"use client";
import React, { useState, useEffect } from 'react';

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                                <p className="text-gray-600 mb-4">{post.subtitle}</p>
                                <div className="text-gray-500 text-sm">
                                    <span>{post.author}</span> | <span>{new Date(post.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogList;