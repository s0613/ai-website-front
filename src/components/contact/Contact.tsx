import React from 'react';
import Button from '../common/Button';

const Contact = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-3xl font-bold text-start text-gray-900 mb-1">광고</h2>
                <p className="text-start text-gray-700 mb-4">AI이미지, 영상으로 시작하는 나의 비즈니스 <br />
                    원하는 모든 상상을 적어주세요</p>
                <form className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            이름
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            이메일
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            광고 내용
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            rows={4}
                            required
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <Button label="제출" type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Contact;