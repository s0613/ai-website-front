"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Search, Folder, ArrowLeft, Plus, Upload, MoreHorizontal, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FolderService, FolderResponse, FileResponse } from "@/features/folder/services/FolderService";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoGenerationFolderProps {
    onSelectImage: (fileUrl: string, fileName: string) => void;
}

export default function VideoGenerationFolder({ onSelectImage }: VideoGenerationFolderProps) {
    const [folders, setFolders] = useState<FolderResponse[]>([]);
    const [files, setFiles] = useState<FileResponse[]>([]);
    const [currentFolder, setCurrentFolder] = useState<FolderResponse | null>(null);
    const [isLoadingFolder, setIsLoadingFolder] = useState(true);
    const [folderError, setFolderError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // 1) 마운트 시 폴더 목록 불러오기
    useEffect(() => {
        fetchFolders();
    }, []);

    // 2) 폴더 목록 조회
    const fetchFolders = async () => {
        try {
            setIsLoadingFolder(true);
            setFolderError(null);
            const data = await FolderService.getFolders();
            setFolders(data);
        } catch (error) {
            console.error("폴더 로딩 오류:", error);
            setFolderError("폴더 목록을 불러오는데 실패했습니다");
        } finally {
            setIsLoadingFolder(false);
        }
    };

    // 3) 폴더 내 파일 조회
    const fetchFiles = async (folderId: number) => {
        try {
            setIsLoadingFolder(true);
            setFolderError(null);
            const filesData = await FolderService.getFilesByFolder(folderId);
            setFiles(filesData);
        } catch (error) {
            console.error("파일 로딩 오류:", error);
            setFolderError("파일 목록을 불러오는데 실패했습니다");
        } finally {
            setIsLoadingFolder(false);
        }
    };

    // 4) 폴더 클릭 핸들러
    const handleFolderClick = async (folder: FolderResponse) => {
        setCurrentFolder(folder);
        await fetchFiles(folder.id);
    };

    // 5) 뒤로가기 핸들러
    const handleBack = () => {
        setCurrentFolder(null);
        setFiles([]);
    };

    // 6) 이미지를 참조 이미지로 설정
    const handleSetReferenceImage = (file: FileResponse) => {
        onSelectImage(file.url, file.name);
        toast.success("참조 이미지로 설정되었습니다");
    };

    // 7) 폴더 생성
    const createFolder = async () => {
        const trimmedName = newFolderName.trim();

        if (!trimmedName) {
            toast.error("폴더 이름을 입력해주세요");
            return;
        }

        if (trimmedName.length > 20) {
            toast.error("폴더 이름은 20자를 초과할 수 없습니다");
            return;
        }

        try {
            await FolderService.createFolder({ name: trimmedName });
            await fetchFolders();
            toast.success("폴더가 생성되었습니다");
            setIsCreateFolderOpen(false);
            setNewFolderName("");
        } catch (err) {
            console.error(err);
            toast.error("폴더 생성에 실패했습니다");
        }
    };

    // 8) 폴더 삭제
    const deleteFolder = async (folderId: number) => {
        try {
            await FolderService.deleteFolder(folderId);
            setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
            toast.success("폴더가 삭제되었습니다");
            if (currentFolder?.id === folderId) {
                handleBack();
            }
        } catch (error) {
            console.error("폴더 삭제 오류:", error);
            toast.error("폴더 삭제에 실패했습니다");
        }
    };

    // 9) 파일 업로드
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!currentFolder || !event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        setIsUploading(true);

        try {
            await FolderService.uploadFile(currentFolder.id, file);
            toast.success(`${file.name} 파일이 업로드되었습니다`);
            await fetchFiles(currentFolder.id);
        } catch (error) {
            console.error("파일 업로드 오류:", error);
            toast.error("파일 업로드에 실패했습니다");
        } finally {
            setIsUploading(false);
        }
    };

    const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFolders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="container mx-auto py-8 px-6 max-w-7xl flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        {currentFolder && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-black/60"
                                onClick={handleBack}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {currentFolder ? currentFolder.name : "내 폴더"}
                            </h1>
                            <p className="text-gray-400">
                                {currentFolder
                                    ? `${files.length}개의 이미지`
                                    : "참조 이미지로 사용할 이미지를 선택하세요"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder={currentFolder ? "이미지 검색..." : "폴더 검색..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-black/40 backdrop-blur-xl border-white/20 text-white w-64"
                            />
                        </div>
                        {!currentFolder ? (
                            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                                        <Plus className="h-4 w-4 mr-2" />
                                        새 폴더
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20">
                                    <DialogHeader>
                                        <DialogTitle className="text-white">새 폴더 만들기</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="folderName" className="text-white">폴더 이름</Label>
                                            <Input
                                                id="folderName"
                                                value={newFolderName}
                                                onChange={(e) => setNewFolderName(e.target.value)}
                                                className="mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white"
                                                placeholder="폴더 이름을 입력하세요 (최대 20자)"
                                                maxLength={20}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30"
                                                onClick={() => setIsCreateFolderOpen(false)}
                                            >
                                                취소
                                            </Button>
                                            <Button
                                                className="bg-sky-500 hover:bg-sky-600 text-white"
                                                onClick={createFolder}
                                            >
                                                만들기
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <div className="relative">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    disabled={isUploading}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
                                >
                                    <Button
                                        className="bg-sky-500 hover:bg-sky-600 text-white"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                업로드 중...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
                                                이미지 업로드
                                            </>
                                        )}
                                    </Button>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40 transition-colors duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                        {isLoadingFolder ? (
                            <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
                                <div className="flex items-center justify-center h-32">
                                    <div className="text-center">
                                        <Loader2 className="h-10 w-10 mx-auto mb-2 text-sky-400 animate-spin" />
                                        <p className="text-white">로딩 중...</p>
                                        <p className="text-sm text-gray-400">잠시만 기다려주세요</p>
                                    </div>
                                </div>
                            </Card>
                        ) : folderError ? (
                            <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
                                <div className="flex flex-col items-center justify-center h-32">
                                    <div className="bg-red-500/20 text-red-400 rounded-full p-4 mb-4">
                                        <AlertTriangle className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        오류가 발생했습니다
                                    </h3>
                                    <p className="text-red-400 text-center mb-4">{folderError}</p>
                                    <Button
                                        onClick={currentFolder ? () => fetchFiles(currentFolder.id) : fetchFolders}
                                        className="bg-sky-500 hover:bg-sky-600 text-white"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        다시 시도
                                    </Button>
                                </div>
                            </Card>
                        ) : !currentFolder ? (
                            // 폴더 목록 표시
                            filteredFolders.map((folder) => (
                                <Card
                                    key={folder.id}
                                    className="group p-6 border border-white/20 bg-black/40 backdrop-blur-xl hover:bg-black/30 hover:backdrop-blur-2xl hover:border-white/40 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                    onClick={() => handleFolderClick(folder)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Folder className="h-6 w-6 text-sky-400 group-hover:text-sky-300 transition-colors duration-300" />
                                            <div>
                                                <h3 className="font-medium text-white group-hover:text-white/90 transition-colors duration-300">{folder.name}</h3>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-white hover:bg-black/60 relative z-10"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-black/40 backdrop-blur-xl border-white/20">
                                                <DropdownMenuItem
                                                    className="text-red-400 hover:bg-black/60"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteFolder(folder.id);
                                                    }}
                                                >
                                                    삭제
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            // 폴더 내 이미지 목록 표시
                            filteredFiles.map((file) => (
                                <Card
                                    key={file.id}
                                    className="p-6 border border-white/20 bg-black/40 backdrop-blur-xl hover:border-white/30 transition-all duration-300 cursor-pointer"
                                    onClick={() => handleSetReferenceImage(file)}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-white truncate max-w-[150px]">
                                                {file.name}
                                            </h3>
                                        </div>
                                        <div className="relative aspect-video w-full overflow-hidden rounded-md">
                                            <img
                                                src={file.url}
                                                alt={file.name}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 