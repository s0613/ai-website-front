"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
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
import { BillingService } from "@/features/payment/services/BillingService";

export interface UpscalerImageSettings {
    upscaling_factor: number;
    overlapping_tiles: boolean;
    checkpoint: string;
    image?: {
        url: string;
        name: string;
    };
}

interface FileResponse {
    id: number;
    name: string;
    url: string;
}

interface UpscalerImageSidebarProps {
    onUpscale: (settings: UpscalerImageSettings) => void;
    isLoading: boolean;
    selectedImage: FileResponse | null;
}

const DEFAULT_SETTINGS: UpscalerImageSettings = {
    upscaling_factor: 4,
    overlapping_tiles: true,
    checkpoint: "v2",
};

const CHECKPOINT_OPTIONS = [
    { value: "v1", label: "버전 1" },
    { value: "v2", label: "버전 2" },
];

export default function UpscalerImageSidebar({
    onUpscale,
    isLoading,
    selectedImage,
}: UpscalerImageSidebarProps) {
    const [settings, setSettings] = useState<UpscalerImageSettings>(DEFAULT_SETTINGS);

    // 부모 컴포넌트에서 selectedImage 변경 시마다 settings에 반영
    useEffect(() => {
        setSettings((prev) => ({
            ...prev,
            image: selectedImage
                ? { url: selectedImage.url, name: selectedImage.name }
                : undefined,
        }));
    }, [selectedImage]);

    const handleCheckpointChange = (value: string) => {
        setSettings((prev) => ({ ...prev, checkpoint: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!settings.image) {
            toast.error("업스케일링할 이미지를 선택해주세요");
            return;
        }

        try {
            // 크레딧 소비 요청
            await BillingService.consumeCredit({
                amount: 3,
                reason: "이미지 업스케일링 사용"
            });

            // 크레딧 소비 성공 시 업스케일링 실행
            onUpscale(settings);
        } catch (error) {
            // 크레딧 부족 등의 에러 처리
            toast.error("크레딧이 부족합니다. 크레딧을 충전해주세요.");
            return;
        }
    };

    // 선택된 이미지를 표시하는 컴포넌트
    const DisplaySelectedImage = ({
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
                        이미지를 선택해주세요
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-[400px] h-full bg-black/90 backdrop-blur-xl border-r border-white/20 flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-10">
            <ScrollArea className="flex-1">
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5" id="upscale-form">
                        <div className="space-y-4">
                            {/* 선택된 이미지 표시 */}
                            <DisplaySelectedImage label="업스케일링할 이미지" image={settings.image} />
                        </div>

                        <div className="space-y-4 mt-6">
                            <div className="space-y-2">
                                <Label>체크포인트 버전</Label>
                                <select
                                    value={settings.checkpoint}
                                    onChange={(e) => handleCheckpointChange(e.target.value)}
                                    className="w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-md p-2.5 text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 focus:outline-none text-white"
                                >
                                    {CHECKPOINT_OPTIONS.map((option) => (
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
                                                id="overlapping_tiles"
                                                checked={settings.overlapping_tiles}
                                                onCheckedChange={(checked) =>
                                                    setSettings((prev) => ({ ...prev, overlapping_tiles: checked }))
                                                }
                                            />
                                            <Label htmlFor="overlapping_tiles">오버랩 타일링</Label>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            이음새를 제거하지만 처리 시간이 2배로 증가합니다
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>업스케일링 배율</Label>
                                            <span className="text-sm text-white font-medium">4x</span>
                                        </div>
                                        <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                                            <p className="text-xs text-gray-400">
                                                현재 4x 업스케일링만 지원됩니다. 이는 원본 이미지 크기를 4배로 키웁니다.
                                                예: 512x512 → 2048x2048
                                            </p>
                                        </div>
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
                    form="upscale-form"
                    className="w-full py-3 bg-sky-500/30 backdrop-blur-md hover:bg-sky-500/40 text-white transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/20 hover:border-sky-500/50 hover:scale-[1.02] font-medium text-base relative"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            <span>업스케일링 중...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <Sparkles className="mr-2 h-5 w-5" />
                            <span>업스케일링하기</span>
                            <span className="absolute right-3 text-sm text-red-400">-3 크레딧</span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
}
