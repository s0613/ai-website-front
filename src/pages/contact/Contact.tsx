"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardFooter, CardTitle, CardContent } from '@/components/ui/card';

const Contact = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            });

            if (!response.ok) {
                throw new Error('문의 전송에 실패했습니다.');
            }

            setError('');
            setSuccess('문의가 성공적으로 전송되었습니다.');
            setName('');
            setEmail('');
            setMessage('');
        } catch (error) {
            setError((error as Error).message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/20">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-white">문의하기</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                                이름
                            </label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 block w-full bg-black/40 backdrop-blur-xl border-white/20 text-white"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                                이메일
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full bg-black/40 backdrop-blur-xl border-white/20 text-white"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="message" className="block text-sm font-medium text-gray-400">
                                메시지
                            </label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-md border border-white/20 bg-black/40 backdrop-blur-xl px-3 py-1 text-base text-white shadow-sm transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        {success && <p className="text-green-400 text-sm">{success}</p>}
                        <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                            전송
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center">
                    <p className="text-sm text-gray-400">
                        문의사항이 있으시면 언제든지 연락주세요.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Contact;