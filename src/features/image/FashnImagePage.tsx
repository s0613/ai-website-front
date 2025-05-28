/* ========================================================================
   FashnImagePage.tsx  –  전체 코드 (생략 없음)
   =======================================================================*/
"use client";

import { useState, useEffect, useRef } from "react";
import { FolderService } from "../../features/folder/services/FolderService";
import type {
    FolderResponse,
    FileResponse,
} from "../../features/folder/services/FolderService";
import EditImageSidebar, {
    type EditImageSettings,
} from "./FashnImageSidebar";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Folder,
    Upload,
    Loader2,
    AlertTriangle,
    MoreHorizontal,
    ArrowLeft,
    Plus,
    CheckCircle,
    ImageIcon,
    CloudUpload,
    X,
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
import { uploadFashnImage } from "./services/ImageService";
import { GenerationNotificationService } from "@/features/admin/services/GenerationNotificationService";
import Masonry from "react-masonry-css";

interface UploadResult {
    file: File;
    success: boolean;
    error?: string;
}

export default function EditImagePage() {
    /* ------------------------------------------------------------------
       상태값
    ------------------------------------------------------------------ */
    const [folders, setFolders] = useState<FolderResponse[]>([]);
    const [selectedFolder, setSelectedFolder] =
        useState<FolderResponse | null>(null);
    const [files, setFiles] = useState<FileResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<number | null>(null);
    const [folderNameError, setFolderNameError] = useState<string | null>(null);
    const [folderError, setFolderError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [showUploadResults, setShowUploadResults] = useState(false);

    /** 1번(의류) / 2번(모델) 슬롯  */
    const [slot1Image, setSlot1Image] = useState<FileResponse | null>(null);
    const [slot2Image, setSlot2Image] = useState<FileResponse | null>(null);

    /** 가상-피팅 호출 로딩 */
    const [isFittingLoading, setIsFittingLoading] = useState(false);

    /** 드래그 앤 드롭 ref */
    const dropZoneRef = useRef<HTMLDivElement>(null);

    /* ------------------------------------------------------------------
       폴더/파일 데이터 로딩
    ------------------------------------------------------------------ */
    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        if (selectedFolder) loadFiles(selectedFolder.id);
    }, [selectedFolder]);

    const loadFolders = async () => {
        try {
            setIsLoading(true);
            setFolderError(null);
            const response = await FolderService.getFolders();
            setFolders(response);
        } catch (e) {
            console.error("폴더 로딩 실패:", e);
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
        } catch (e) {
            console.error("파일 로딩 실패:", e);
            setFolderError("파일 목록을 불러오는데 실패했습니다");
        } finally {
            setIsLoading(false);
        }
    };

    /* ------------------------------------------------------------------
       파일 업로드 (일반 폴더)
    ------------------------------------------------------------------ */
    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!selectedFolder || !e.target.files?.length) return;

        const files = Array.from(e.target.files);
        await handleMultipleFileUpload(files);
    };

    /* ------------------------------------------------------------------
       드래그 앤 드롭 이벤트 핸들러
    ------------------------------------------------------------------ */
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedFolder && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // 드롭존을 완전히 벗어날 때만 isDragOver를 false로 설정
        if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (!selectedFolder) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        await handleMultipleFileUpload(files);
    };

    /* ------------------------------------------------------------------
       다중 파일 업로드
    ------------------------------------------------------------------ */
    const handleMultipleFileUpload = async (files: File[]) => {
        if (!selectedFolder) return;

        setIsUploading(true);
        const results: UploadResult[] = [];

        for (const file of files) {
            // 이미지 파일인지 확인
            if (!file.type.startsWith('image/')) {
                results.push({
                    file,
                    success: false,
                    error: '이미지 파일만 업로드 가능합니다'
                });
                continue;
            }

            try {
                const resp = await FolderService.uploadFile(selectedFolder.id, file);
                setFiles((prev) => [...prev, resp]);
                results.push({
                    file,
                    success: true
                });
            } catch (error) {
                console.error(`파일 업로드 오류 (${file.name}):`, error);
                results.push({
                    file,
                    success: false,
                    error: '업로드에 실패했습니다'
                });
            }
        }

        // 결과 처리
        const successCount = results.filter(r => r.success).length;
        const errorCount = results.filter(r => !r.success).length;

        if (successCount > 0) {
            toast.success(`${successCount}개의 파일이 업로드되었습니다`);
        }

        if (errorCount > 0) {
            setUploadResults(results.filter(r => !r.success));
            setShowUploadResults(true);
        }

        setIsUploading(false);
    };

    /* ------------------------------------------------------------------
       폴더 생성/삭제
    ------------------------------------------------------------------ */
    const createFolder = async () => {
        const trimmed = newFolderName.trim();
        if (!trimmed) return toast.error("폴더 이름을 입력해주세요");
        if (trimmed.length > 20)
            return toast.error("폴더 이름은 20자를 초과할 수 없습니다");

        try {
            await FolderService.createFolder({ name: trimmed });
            await loadFolders();
            toast.success("폴더가 생성되었습니다");
            setIsCreateFolderOpen(false);
            setNewFolderName("");
        } catch {
            toast.error("폴더 생성에 실패했습니다");
        }
    };

    const handleDeleteClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setFolderToDelete(id);
        setIsDeleteFolderOpen(true);
    };

    const deleteFolder = async () => {
        if (!folderToDelete) return;
        try {
            const result = await FolderService.deleteFolder(folderToDelete);
            if (!result.success) {
                return toast.error(result.message || "폴더 삭제에 실패했습니다");
            }
            setFolders((prev) => prev.filter((f) => f.id !== folderToDelete));
            toast.success("폴더가 삭제되었습니다");
            if (selectedFolder?.id === folderToDelete) {
                setSelectedFolder(null);
                setFiles([]);
                setSlot1Image(null);
                setSlot2Image(null);
            }
        } catch (err: unknown) {
            console.error("폴더 삭제 오류:", err);
            toast.error("폴더 삭제에 실패했습니다");
        } finally {
            setIsDeleteFolderOpen(false);
            setFolderToDelete(null);
        }
    };

    /* ------------------------------------------------------------------
       이미지 선택-슬롯 로직
    ------------------------------------------------------------------ */
    const handleSelectImage = (file: FileResponse) => {
        if (slot1Image?.id === file.id) {
            setSlot1Image(null);
            toast.success("의류 이미지가 해제되었습니다.");
            return;
        }
        if (slot2Image?.id === file.id) {
            setSlot2Image(null);
            toast.success("모델 이미지가 해제되었습니다.");
            return;
        }
        if (!slot1Image) {
            setSlot1Image(file);
            toast.success("의류 이미지로 선택되었습니다.");
            return;
        }
        if (!slot2Image) {
            setSlot2Image(file);
            toast.success("모델 이미지로 선택되었습니다.");
            return;
        }
        toast("이미 의류/모델 이미지가 모두 선택되었습니다. 먼저 해제해주세요.");
    };

    /* ------------------------------------------------------------------
       가상-피팅 실행
    ------------------------------------------------------------------ */
    const handleGenerate = async (settings: EditImageSettings) => {
        setIsFittingLoading(true);
        try {
            if (!settings.slot1?.url || !settings.slot2?.url)
                throw new Error("의류 이미지와 모델 이미지를 모두 선택해주세요.");

            /* ---- 1. Fashn(Edge) API 호출 --------------------------------- */
            const fd = new FormData();
            fd.append("model_image_url", settings.slot2.url);
            fd.append("garment_image_url", settings.slot1.url);
            fd.append("category", settings.category || "tops");
            fd.append("mode", settings.mode);
            fd.append("garment_photo_type", settings.garment_photo_type);
            fd.append("moderation_level", settings.moderation_level);
            fd.append("seed", String(settings.seed));
            fd.append("num_samples", String(settings.num_samples));
            fd.append("segmentation_free", String(settings.segmentation_free));

            const res = await fetch("/internal/image/edit/fashn", {
                method: "POST",
                body: fd,
            });
            const data: {
                success: boolean;
                imageUrl: string | { url: string;[k: string]: unknown };
                error?: string;
            } = await res.json();

            if (!res.ok || !data.success || !data.imageUrl) {
                throw new Error(data.error || "가상 피팅 결과를 받지 못했습니다.");
            }

            /* ---- 2. imageUrl 추출(문자열) -------------------------------- */
            const resultUrl =
                typeof data.imageUrl === "string" ? data.imageUrl : data.imageUrl.url;

            if (!resultUrl)
                throw new Error("가상 피팅 결과 이미지 URL을 확인할 수 없습니다.");

            /* ---- 3. 백엔드(S3)로 저장 ------------------------------------ */
            const uploadResp = await uploadFashnImage(resultUrl);
            console.log("결과 이미지 업로드 완료:", uploadResp);

            /* ---- 4. UI 갱신 --------------------------------------------- */
            if (selectedFolder) await loadFiles(selectedFolder.id);
            toast.success("가상 피팅이 완료되었습니다!");

            // 1. 알림 생성 (가상 피팅 시작)
            if (slot2Image?.url) {
                try {
                    await GenerationNotificationService.createNotification({
                        title: "가상 피팅하기",
                        thumbnailUrl: slot2Image.url,
                    });
                    // Bell 새로고침 이벤트
                    window.dispatchEvent(new Event('open-notification-bell'));
                } catch (e) {
                    // 알림 생성 실패는 치명적이지 않으므로 무시
                    console.error("알림 생성 실패:", e);
                }
            }
        } catch (err: unknown) {
            console.error("가상 피팅 실패:", err);
            let msg = (err instanceof Error ? err.message : String(err));
            if (msg.includes("Failed to detect body pose")) {
                msg = "모델 이미지에서 사람의 신체를 인식하지 못했습니다. 정면이 잘 나온 이미지를 사용해 주세요.";
            }
            toast.error(msg || "가상 피팅에 실패했습니다");
        } finally {
            setIsFittingLoading(false);
        }
    };

    /* ------------------------------------------------------------------
       필터링된 폴더/파일
    ------------------------------------------------------------------ */
    const filteredFiles = files.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredFolders = folders.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /* ------------------------------------------------------------------
       JSX – UI
    ------------------------------------------------------------------ */
    return (
        <div className="flex h-screen bg-black overflow-hidden fixed inset-0 pt-16">
            {/* ------------------------------------------------------------ */}
            {/*   1. 사이드바                                                */}
            {/* ------------------------------------------------------------ */}
            <EditImageSidebar
                onGenerate={handleGenerate}
                isLoading={isFittingLoading}
                slot1Image={slot1Image}
                slot2Image={slot2Image}
            />

            {/* ------------------------------------------------------------ */}
            {/*   2. 폴더/파일 뷰                                           */}
            {/* ------------------------------------------------------------ */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="container mx-auto p-6 max-w-7xl flex flex-col h-full">
                    {/* ---------------- 헤더 ---------------- */}
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
                                    {selectedFolder
                                        ? `${files.length}개의 이미지`
                                        : "수정할 이미지를 선택하세요"}
                                </p>
                            </div>
                        </div>

                        {/* --------------- 검색 & 새 폴더/업로드 --------------- */}
                        <div className="flex items-center gap-2">


                            {/* ---- 폴더 루트 뷰 : 새 폴더 버튼 ---- */}
                            {!selectedFolder ? (
                                <Dialog
                                    open={isCreateFolderOpen}
                                    onOpenChange={setIsCreateFolderOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                                            <Plus className="h-4 w-4 mr-2" />
                                            새 폴더
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">
                                                새 폴더 만들기
                                            </DialogTitle>
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
                                                        const v = e.target.value;
                                                        setNewFolderName(v);
                                                        setFolderNameError(
                                                            v.toLowerCase() === "upload"
                                                                ? "upload라는 이름의 폴더는 생성할 수 없습니다."
                                                                : null
                                                        );
                                                    }}
                                                    maxLength={20}
                                                    placeholder="폴더 이름을 입력하세요 (최대 20자)"
                                                    className={`mt-1 bg-black/40 backdrop-blur-xl border-white/20 text-white ${folderNameError ? "border-red-500" : ""
                                                        }`}
                                                />
                                                {folderNameError && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {folderNameError}
                                                    </p>
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
                                /* ---- 폴더 내부 뷰 : 이미지 업로드 ---- */
                                <div className="relative">
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        disabled={isUploading}
                                        onChange={handleFileUpload}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={isUploading ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                        <Button
                                            className="bg-sky-500 hover:bg-sky-600 text-white"
                                            disabled={isUploading}
                                            onClick={() =>
                                                document.getElementById("file-upload")?.click()
                                            }
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

                    {/* ----------------- 내용(폴더 or 파일 그리드) ----------------- */}
                    <div
                        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40 pr-2 relative"
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        ref={dropZoneRef}
                    >
                        {/* 드래그 오버 시 드롭존 */}
                        {isDragOver && selectedFolder && (
                            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                                <div className="border-2 border-dashed border-sky-400 rounded-lg p-12 bg-sky-500/10 backdrop-blur-xl">
                                    <div className="text-center">
                                        <CloudUpload className="h-16 w-16 mx-auto mb-4 text-sky-400" />
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            이미지를 여기에 드롭하세요
                                        </h3>
                                        <p className="text-gray-300">
                                            여러 이미지를 한번에 업로드할 수 있습니다
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                            {/* ----------- 로딩/오류 처리 ----------- */}
                            {isLoading ? (
                                <Card className="p-4 border border-white/20 bg-black/40 backdrop-blur-xl">
                                    <div className="flex items-center justify-center h-32">
                                        <Loader2 className="h-10 w-10 text-sky-400 animate-spin mb-2" />
                                        <p className="text-white">로딩 중...</p>
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
                                        <p className="text-red-400 text-center mb-4">
                                            {folderError}
                                        </p>
                                        <Button
                                            onClick={
                                                selectedFolder
                                                    ? () => loadFiles(selectedFolder.id)
                                                    : loadFolders
                                            }
                                            className="bg-sky-500 hover:bg-sky-600 text-white"
                                        >
                                            <Loader2 className="w-4 h-4 mr-2" />
                                            다시 시도
                                        </Button>
                                    </div>
                                </Card>
                            ) : /* ----------- 폴더 뷰 ----------- */
                                !selectedFolder ? (
                                    filteredFolders.map((folder) => (
                                        <Card
                                            key={folder.id}
                                            className="group p-6 border border-white/10 bg-black/40 backdrop-blur-xl hover:bg-black/30 hover:border-sky-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                            onClick={() => setSelectedFolder(folder)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Folder className="h-6 w-6 text-sky-400 group-hover:text-sky-300" />
                                                    <div>
                                                        <h3 className="font-medium text-white">
                                                            {folder.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-white hover:bg-black/60"
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
                                ) : filteredFiles.length === 0 ? (
                                    /* -------- 빈 폴더 placeholder -------- */
                                    <div className="col-span-full flex items-center justify-center h-full min-h-[400px]">
                                        <div className="text-center">
                                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 max-w-md mx-auto">
                                                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                                                <h3 className="text-xl font-semibold text-white mb-2">
                                                    아직 이미지가 없습니다
                                                </h3>
                                                <p className="text-gray-400 mb-6">
                                                    이미지를 드래그 앤 드롭하거나<br />
                                                    업로드 버튼을 사용해 이미지를 추가하세요
                                                </p>
                                                <Button
                                                    className="bg-sky-500 hover:bg-sky-600 text-white"
                                                    onClick={() => document.getElementById("file-upload")?.click()}
                                                    disabled={isUploading}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    이미지 선택
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : /* ----------- 파일 뷰 ----------- */
                                    (
                                        <Masonry
                                            breakpointCols={{
                                                default: 4,
                                                1100: 3,
                                                700: 2,
                                                500: 1
                                            }}
                                            className="my-masonry-grid col-span-full"
                                            columnClassName="my-masonry-grid_column"
                                        >
                                            {filteredFiles.map((file) => {
                                                const isSlot1 = slot1Image?.id === file.id;
                                                const isSlot2 = slot2Image?.id === file.id;
                                                return (
                                                    <Card
                                                        key={file.id}
                                                        className={cn(
                                                            "relative cursor-pointer overflow-hidden group mb-4 break-inside-avoid",
                                                            "transition-all duration-300",
                                                            isSlot1 || isSlot2
                                                                ? "border-sky-500/50"
                                                                : "border-white/10",
                                                            "border hover:border-sky-500/50",
                                                            "bg-black/40 backdrop-blur-xl hover:bg-black/60"
                                                        )}
                                                        onClick={() => handleSelectImage(file)}
                                                    >
                                                        <div className="relative">
                                                            <Image
                                                                src={file.url}
                                                                alt={file.name}
                                                                width={300}
                                                                height={200}
                                                                className="w-full h-auto object-cover"
                                                                sizes="(max-width: 500px) 100vw, (max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                                                <p className="text-sm text-white truncate font-medium">
                                                                    {file.name}
                                                                </p>
                                                            </div>
                                                            {(isSlot1 || isSlot2) && (
                                                                <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs rounded-full px-2 py-1 flex items-center gap-1">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    {isSlot1 ? "1번" : "2번"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </Masonry>
                                    )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/*   3. 폴더 삭제 다이얼로그                                     */}
            {/* ------------------------------------------------------------ */}
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

            {/* ------------------------------------------------------------ */}
            {/*   4. 업로드 에러 결과 다이얼로그                               */}
            {/* ------------------------------------------------------------ */}
            <Dialog open={showUploadResults} onOpenChange={setShowUploadResults}>
                <DialogContent className="bg-black/40 backdrop-blur-xl border-white/20 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            업로드 오류
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-white text-sm">
                            다음 파일들이 업로드되지 않았습니다:
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {uploadResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 p-2 bg-red-500/10 rounded border border-red-500/20"
                                >
                                    <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {result.file.name}
                                        </p>
                                        <p className="text-xs text-red-400">
                                            {result.error}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <Button
                                className="bg-sky-500 hover:bg-sky-600 text-white"
                                onClick={() => {
                                    setShowUploadResults(false);
                                    setUploadResults([]);
                                }}
                            >
                                확인
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ------------------------------------------------------------ */}
            {/*   5. 업로드 중 로딩 오버레이                                   */}
            {/* ------------------------------------------------------------ */}
            {isUploading && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-8">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 mx-auto mb-4 text-sky-400 animate-spin" />
                            <h3 className="text-lg font-semibold text-white mb-2">
                                이미지 업로드 중...
                            </h3>
                            <p className="text-gray-400">
                                잠시만 기다려주세요
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
