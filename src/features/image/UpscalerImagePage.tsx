"use client";

import { useState, useEffect } from "react";
import { FolderService, type FolderResponse, type FileResponse } from "../../pages/folder/services/FolderService";
import UpscalerImageSidebar, { type UpscalerImageSettings } from "./UpscalerImageSidebar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Folder,
    Upload,
    Search,
    Loader2,
    AlertTriangle,
    MoreHorizontal,
    ArrowLeft,
    Plus,
    CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

export default function UpscalerImagePage() {
    const [folders, setFolders] = useState<FolderResponse[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<FolderResponse | null>(null);
    const [files, setFiles] = useState<FileResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<number | null>(null);
    const [folderNameError, setFolderNameError] = useState<string | null>(null);
    const [folderError, setFolderError] = useState<string | null>(null);

    // 업스케일링할 이미지
    const [selectedImage, setSelectedImage] = useState<FileResponse | null>(null);

    // 업스케일링 로딩 상태
    const [isUpscalingLoading, setIsUpscalingLoading] = useState(false);

    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        if (selectedFolder) {
            loadFiles(selectedFolder.id);
        }
    }, [selectedFolder]);

    const loadFolders = async () => {
        try {
            setIsLoading(true);
            setFolderError(null);
            const response = await FolderService.getFolders();
            setFolders(response);
            if (response.length > 0) {
                setSelectedFolder(response[0]);
            }
        } catch (error) {
            console.error("폴더 로딩 실패:", error);
            setFolderError("폴더 목록을 불러오는데 실패했습니다");
        } finally {
            setIsLoading(false);
        }
    };

    const loadFiles = async (folderId: number) => {
        try {
            setIsLoading(true);
            setFolderError(null);
            const response = await FolderService.getFilesByFolder(folderId);
            setFiles(response);
        } catch (error) {
            console.error("파일 로딩 실패:", error);
            setFolderError("파일 목록을 불러오는데 실패했습니다");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedFolder || !event.target.files || event.target.files.length === 0) return;

        const file = event.target.files[0];
        setIsUploading(true);
        try {
            const response = await FolderService.uploadFile(selectedFolder.id, file);
            setFiles((prev) => [...prev, response]);
            toast.success(`${file.name} 파일이 업로드되었습니다`);
        } catch (error) {
            console.error("파일 업로드 실패:", error);
            toast.error("파일 업로드에 실패했습니다");
        } finally {
            setIsUploading(false);
        }
    };

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
            await loadFolders();
            toast.success("폴더가 생성되었습니다");
            setIsCreateFolderOpen(false);
            setNewFolderName("");
        } catch (err) {
            console.error(err);
            toast.error("폴더 생성에 실패했습니다");
        }
    };

    const handleDeleteClick = (folderId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setFolderToDelete(folderId);
        setIsDeleteFolderOpen(true);
    };

    const deleteFolder = async () => {
        if (!folderToDelete) return;

        try {
            await FolderService.deleteFolder(folderToDelete);
            setFolders((prev) => prev.filter((folder) => folder.id !== folderToDelete));
            toast.success("폴더가 삭제되었습니다");
            if (selectedFolder?.id === folderToDelete) {
                setSelectedFolder(null);
                setFiles([]);
            }
        } catch (error) {
            console.error("폴더 삭제 오류:", error);
            if (error && typeof error === "object" && "response" in error && error.response) {
                const response = error.response as { data?: { message?: string }; status?: number };
                if (response.status === 500) {
                    toast.error("서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                } else {
                    toast.error("폴더 삭제에 실패했습니다: " + (response.data?.message || "알 수 없는 오류"));
                }
            } else if (error && typeof error === "object" && "request" in error) {
                toast.error("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
            } else {
                toast.error("폴더 삭제에 실패했습니다");
            }
        } finally {
            setIsDeleteFolderOpen(false);
            setFolderToDelete(null);
        }
    };

    const handleSelectImage = (file: FileResponse) => {
        // 이미 선택된 이미지를 다시 클릭하면 선택 해제
        if (selectedImage && selectedImage.id === file.id) {
            setSelectedImage(null);
            toast.success("이미지 선택이 해제되었습니다");
            return;
        }

        // 새로운 이미지 선택
        setSelectedImage(file);
        toast.success("업스케일링할 이미지로 선택되었습니다");
    };

    const handleUpscale = async (settings: UpscalerImageSettings) => {
        setIsUpscalingLoading(true);
        try {
            // TODO: 실제 API 호출 로직 구현
            const response = await fetch("/api/image/edit/upscaler", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    image_url: settings.image?.url,
                    upscaling_factor: settings.upscaling_factor,
                    overlapping_tiles: settings.overlapping_tiles,
                    checkpoint: settings.checkpoint,
                }),
            });

            if (!response.ok) {
                throw new Error("업스케일링 실패");
            }

            const result = await response.json();
            toast.success("이미지 업스케일링이 완료되었습니다!");
            // TODO: 결과 이미지 처리 로직 추가
        } catch (error) {
            console.error("업스케일링 실패:", error);
            toast.error("이미지 업스케일링에 실패했습니다");
        } finally {
            setIsUpscalingLoading(false);
        }
    };

    // 폴더/파일 목록 필터링
    const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredFolders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-black overflow-hidden fixed inset-0 pt-16">
            <UpscalerImageSidebar
                onUpscale={handleUpscale}
                isLoading={isUpscalingLoading}
                selectedImage={selectedImage}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="container mx-auto p-6 max-w-7xl flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            {selectedFolder && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-black/60"
                                    onClick={() => setSelectedFolder(null)}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {selectedFolder ? selectedFolder.name : "내 폴더"}
                                </h1>
                                <p className="text-gray-400">
                                    {selectedFolder ? `${files.length}개의 이미지` : "업스케일링할 이미지를 선택하세요"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder={selectedFolder ? "이미지 검색..." : "폴더 검색..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-black/40 backdrop-blur-xl border-white/20 text-white w-64"
                                />
                            </div>
                            {!selectedFolder ? (
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
                                                <Label htmlFor="folderName" className="text-white">
                                                    폴더 이름
                                                </Label>
                                                <Input
                                                    id="folderName"
                                                    value={newFolderName}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setNewFolderName(value);
                                                        if (value.toLowerCase() === "upload") {
                                                            setFolderNameError("upload라는 이름의 폴더는 생성할 수 없습니다.");
                                                        } else {
                                                            setFolderNameError(null);
                                                        }
                                                    }}
                                                    className={`mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white ${folderNameError ? "border-red-500" : ""
                                                        }`}
                                                    placeholder="폴더 이름을 입력하세요 (최대 20자)"
                                                    maxLength={20}
                                                />
                                                {folderNameError && (
                                                    <p className="text-red-500 text-sm mt-1">{folderNameError}</p>
                                                )}
                                            </div>
                                            <DialogFooter>
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
                                                    disabled={!!folderNameError}
                                                >
                                                    만들기
                                                </Button>
                                            </DialogFooter>
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
                                        className={`cursor-pointer ${isUploading ? "opacity-50" : ""}`}
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

                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40 transition-colors duration-200 pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                            {isLoading ? (
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
                                            onClick={selectedFolder ? () => loadFiles(selectedFolder.id) : loadFolders}
                                            className="bg-sky-500 hover:bg-sky-600 text-white"
                                        >
                                            <Loader2 className="w-4 h-4 mr-2" />
                                            다시 시도
                                        </Button>
                                    </div>
                                </Card>
                            ) : !selectedFolder ? (
                                filteredFolders.map((folder) => (
                                    <Card
                                        key={folder.id}
                                        className="group p-6 border border-white/10 bg-black/40 backdrop-blur-xl hover:bg-black/30 hover:backdrop-blur-2xl hover:border-sky-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                        onClick={() => setSelectedFolder(folder)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <Folder className="h-6 w-6 text-sky-400 group-hover:text-sky-300 transition-colors duration-300" />
                                                <div>
                                                    <h3 className="font-medium text-white group-hover:text-white/90 transition-colors duration-300">
                                                        {folder.name}
                                                    </h3>
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
                                                        onClick={(e) => handleDeleteClick(folder.id, e)}
                                                    >
                                                        삭제
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                filteredFiles.map((file) => {
                                    const isSelected = selectedImage && selectedImage.id === file.id;

                                    return (
                                        <Card
                                            key={file.id}
                                            className={cn(
                                                "relative aspect-square cursor-pointer overflow-hidden group border-white/10 hover:border-sky-500/50 transition-all duration-300",
                                                isSelected ? "border-sky-500/50" : "border-white/10"
                                            )}
                                            onClick={() => handleSelectImage(file)}
                                        >
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
                                            <Image
                                                src={file.url}
                                                alt={file.name}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute bottom-2 left-2 right-2 text-sm text-white truncate">
                                                {file.name}
                                            </div>
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs rounded-full px-2 py-1 flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    선택됨
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 폴더 삭제 확인 다이얼로그 */}
            <Dialog open={isDeleteFolderOpen} onOpenChange={setIsDeleteFolderOpen}>
                <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20">
                    <DialogHeader>
                        <DialogTitle className="text-white">폴더 삭제 확인</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-white">
                            정말로 이 폴더를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                className="bg-black/40 backdrop-blur-xl border-white/20 text-white hover:bg-black/60 hover:border-white/30"
                                onClick={() => setIsDeleteFolderOpen(false)}
                            >
                                취소
                            </Button>
                            <Button
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={deleteFolder}
                            >
                                삭제
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
