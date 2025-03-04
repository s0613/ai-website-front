"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Grid, Plus, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const VideoPage = () => {
    const { email } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // 여기서 파일을 처리하거나 업로드 요청을 보냅니다.
            console.log("선택한 파일:", file);
        }
    };

    return (
        <div className="flex-1">
            <header className="flex items-center justify-between border-b px-6 py-4">
                <div className="w-96">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input type="search" placeholder="영상 검색..." className="pl-9" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon">
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center">
                        <div className="mr-2 text-sm font-medium">{email}</div>
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-blue-500 text-white flex items-center justify-center">
                            {email ? email.charAt(0).toUpperCase() : "U"}
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-6">
                <div className="mb-6 flex items-center gap-4">
                    <Button 
                        className="gap-2"
                        onClick={() => router.push('/video')}
                    >
                        <Plus className="h-4 w-4" />
                        새 영상 생성
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleUploadButtonClick}>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path
                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        영상 업로드
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        새 폴더
                    </Button>
                </div>

                <div className="mb-6">
                    <Tabs defaultValue="recent">
                        <TabsList>
                            <TabsTrigger value="recent">최근</TabsTrigger>
                            <TabsTrigger value="created">생성된 영상</TabsTrigger>
                            <TabsTrigger value="reference">레퍼런스 영상</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>
            {/* hidden file input 추가 */}
            <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
        </div>
    );
};

export default VideoPage;