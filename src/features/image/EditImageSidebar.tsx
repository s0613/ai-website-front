"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
    Loader2,
    Settings,
    Sparkles,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

export interface EditImageSettings {
    category: string;
    garment_photo_type: string;
    cover_feet: boolean;
    adjust_hands: boolean;
    restore_background: boolean;
    restore_clothes: boolean;
    long_top: boolean;
    guidance_scale: number;
    seed: number;
    // slot1 = 의류 이미지
    // slot2 = 모델 이미지
    slot1?: {
        url: string;
        name: string;
    };
    slot2?: {
        url: string;
        name: string;
    };
}

interface FileResponse {
    id: number;
    name: string;
    url: string;
}

interface EditImageSidebarProps {
    onGenerate: (settings: EditImageSettings) => void;
    isLoading: boolean;
    slot1Image: FileResponse | null; // 의류
    slot2Image: FileResponse | null; // 모델
}

const DEFAULT_SETTINGS: EditImageSettings = {
    category: "tops",
    garment_photo_type: "auto",
    cover_feet: false,
    adjust_hands: false,
    restore_background: false,
    restore_clothes: false,
    long_top: false,
    guidance_scale: 2,
    seed: 42,
};

const CATEGORY_OPTIONS = [
    { value: "tops", label: "상의" },
    { value: "bottoms", label: "하의" },
    { value: "one-pieces", label: "원피스" },
];

const GARMENT_PHOTO_TYPE_OPTIONS = [
    { value: "auto", label: "자동 감지" },
    { value: "model", label: "모델 착용" },
    { value: "flat-lay", label: "평면 촬영" },
];

export default function EditImageSidebar({
    onGenerate,
    isLoading,
    slot1Image,
    slot2Image,
}: EditImageSidebarProps) {
    const [settings, setSettings] = useState<EditImageSettings>(DEFAULT_SETTINGS);

    // 부모 컴포넌트에서 slot1Image, slot2Image 변경 시마다 settings에 반영
    useEffect(() => {
        setSettings((prev) => ({
            ...prev,
            slot1: slot1Image
                ? { url: slot1Image.url, name: slot1Image.name }
                : undefined,
            slot2: slot2Image
                ? { url: slot2Image.url, name: slot2Image.name }
                : undefined,
        }));
    }, [slot1Image, slot2Image]);

    const handleCategoryChange = (value: string) => {
        setSettings((prev) => ({ ...prev, category: value }));
    };

    const handleGarmentPhotoTypeChange = (value: string) => {
        setSettings((prev) => ({ ...prev, garment_photo_type: value }));
    };

    const handleGuidanceScaleChange = (value: number[]) => {
        setSettings((prev) => ({ ...prev, guidance_scale: value[0] }));
    };

    const handleSeedChange = (value: string) => {
        setSettings((prev) => ({ ...prev, seed: parseInt(value) || 42 }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!settings.slot1) {
            toast.error("1번(의류) 이미지를 선택해주세요");
            return;
        }
        if (!settings.slot2) {
            toast.error("2번(모델) 이미지를 선택해주세요");
            return;
        }
        onGenerate(settings);
    };

    // 간단히 의류/모델 이미지를 표시하는 컴포넌트
    const DisplaySlotImage = ({
        label,
        image,
    }: {
        label: string;
        image?: { url: string; name: string };
    }) => {
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                    {label}
                </label>
                {image ? (
                    <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                        <Image
                            src={image.url}
                            alt={image.name}
                            fill
                            className="object-contain"
                        />
                    </div>
                ) : (
                    <div className="w-full h-48 flex items-center justify-center border border-dashed border-white/20 rounded-lg text-gray-400 text-sm">
                        {label} 미선택
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-[400px] h-full bg-black/90 backdrop-blur-xl border-r border-white/20 flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-10">
            <ScrollArea className="flex-1">
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5" id="edit-form">
                        <div className="space-y-4">
                            {/* 1번(의류) 이미지 */}
                            <DisplaySlotImage label="1번 의류 이미지" image={settings.slot1} />
                            {/* 2번(모델) 이미지 */}
                            <DisplaySlotImage label="2번 모델 이미지" image={settings.slot2} />
                        </div>

                        <div className="space-y-4 mt-6">
                            <div className="space-y-2">
                                <Label>의류 카테고리</Label>
                                <select
                                    value={settings.category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-2.5 text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none text-white"
                                >
                                    {CATEGORY_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>의류 이미지 타입</Label>
                                <select
                                    value={settings.garment_photo_type}
                                    onChange={(e) => handleGarmentPhotoTypeChange(e.target.value)}
                                    className="w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-2.5 text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none text-white"
                                >
                                    {GARMENT_PHOTO_TYPE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="border border-white/10 rounded-lg p-4 bg-black/30 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                                    <Settings className="h-4 w-4 text-sky-500" />
                                    세부 설정
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="cover_feet"
                                                checked={settings.cover_feet}
                                                onCheckedChange={(checked) =>
                                                    setSettings((prev) => ({ ...prev, cover_feet: checked }))
                                                }
                                            />
                                            <Label htmlFor="cover_feet">발/신발 커버</Label>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            긴 옷이 발/신발을 가리도록 허용
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="adjust_hands"
                                                checked={settings.adjust_hands}
                                                onCheckedChange={(checked) =>
                                                    setSettings((prev) => ({ ...prev, adjust_hands: checked }))
                                                }
                                            />
                                            <Label htmlFor="adjust_hands">손 조정</Label>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            손의 모습을 자연스럽게 조정
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="restore_background"
                                                checked={settings.restore_background}
                                                onCheckedChange={(checked) =>
                                                    setSettings((prev) => ({ ...prev, restore_background: checked }))
                                                }
                                            />
                                            <Label htmlFor="restore_background">배경 유지</Label>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            원본 이미지의 배경을 보존
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="restore_clothes"
                                                checked={settings.restore_clothes}
                                                onCheckedChange={(checked) =>
                                                    setSettings((prev) => ({ ...prev, restore_clothes: checked }))
                                                }
                                            />
                                            <Label htmlFor="restore_clothes">다른 의류 유지</Label>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            변경되지 않는 의류의 모습 보존
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="long_top"
                                                checked={settings.long_top}
                                                onCheckedChange={(checked) =>
                                                    setSettings((prev) => ({ ...prev, long_top: checked }))
                                                }
                                            />
                                            <Label htmlFor="long_top">긴 상의</Label>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            긴 상의 최적화 (코트, 원피스 등)
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>가이던스 스케일: {settings.guidance_scale}</Label>
                                        <Slider
                                            value={[settings.guidance_scale]}
                                            onValueChange={handleGuidanceScaleChange}
                                            min={1}
                                            max={20}
                                            step={0.5}
                                            className="[&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500"
                                        />
                                        <p className="text-xs text-gray-400">
                                            의류 스타일을 얼마나 충실히 반영할지 결정합니다
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="seed">시드값</Label>
                                        <Input
                                            id="seed"
                                            type="number"
                                            placeholder="42 (기본값)"
                                            value={settings.seed}
                                            onChange={(e) => handleSeedChange(e.target.value)}
                                            className="border-white/20 bg-black/30 text-white placeholder:text-gray-400"
                                        />
                                        <p className="text-xs text-gray-400">
                                            같은 시드값을 사용하면 비슷한 결과가 나옵니다
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </ScrollArea>

            <div className="p-3 border-t border-white/10 bg-black/30 backdrop-blur-md">
                <Button
                    type="submit"
                    form="edit-form"
                    className="w-full py-3 bg-sky-500/30 backdrop-blur-md hover:bg-sky-500/40 text-white transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/20 hover:border-sky-500/50 hover:scale-[1.02] font-medium text-base relative"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            <span>가상 피팅 중...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <Sparkles className="mr-2 h-5 w-5" />
                            <span>가상 피팅하기</span>
                            <span className="absolute right-3 text-sm text-red-400">-5 크레딧</span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
}
