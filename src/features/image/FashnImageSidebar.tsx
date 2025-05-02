/* =======================================================================
   FashnImageSidebar.tsx         (← 기존 EditImageSidebar.tsx 를 교체)
   =======================================================================*/
"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import {
    Loader2,
    Settings,
    Sparkles,
} from "lucide-react";

import { BillingService } from "@/features/payment/services/BillingService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

/* ------------------------------------------------------------------ */
/*  타입                                                               */
/* ------------------------------------------------------------------ */
export interface EditImageSettings {
    category: string;
    mode: string;
    garment_photo_type: string;
    moderation_level: string;
    seed: number;
    num_samples: number;
    segmentation_free: boolean;
    guidance_scale?: number;          // ✅ 새로 추가
    slot1?: { url: string; name: string };
    slot2?: { url: string; name: string };
    output_filename: string;
}

interface FileResponse {
    id: number;
    name: string;
    url: string;
}

interface EditImageSidebarProps {
    onGenerate: (settings: EditImageSettings) => void;
    isLoading: boolean;
    slot1Image: FileResponse | null;
    slot2Image: FileResponse | null;
}

/* ------------------------------------------------------------------ */
/*  상수                                                               */
/* ------------------------------------------------------------------ */
const DEFAULT_SETTINGS: EditImageSettings = {
    category: "auto",
    mode: "balanced",
    garment_photo_type: "auto",
    moderation_level: "permissive",
    seed: 42,
    num_samples: 1,
    segmentation_free: true,
    guidance_scale: 7.5,              // ✅ 기본값
    output_filename: "",
};

const CATEGORY_OPTIONS = [
    { value: "auto", label: "자동 감지", description: "AI가 업로드된 의류 이미지를 분석하여 상의/하의/원피스 중 적절한 카테고리를 자동으로 선택합니다" },
    { value: "tops", label: "상의" },
    { value: "bottoms", label: "하의" },
    { value: "one-pieces", label: "원피스" },
];

const GARMENT_PHOTO_TYPE_OPTIONS = [
    { value: "auto", label: "자동 감지", description: "AI가 업로드된 의류 이미지를 분석하여 모델 착용/평면 촬영 여부를 자동으로 판단합니다" },
    { value: "model", label: "모델 착용" },
    { value: "flat-lay", label: "평면 촬영" },
];

const MODE_OPTIONS = [
    { value: "performance", label: "빠른 생성" },
    { value: "balanced", label: "균형 잡힌 생성" },
    { value: "quality", label: "고품질 생성" },
];

const MODERATION_LEVEL_OPTIONS = [
    { value: "none", label: "없음" },
    { value: "permissive", label: "기본" },
    { value: "conservative", label: "엄격" },
];

/* 유니크한 파일 이름 생성 */
const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName?.includes(".")
        ? originalName.split(".").pop()
        : "png";                         // ✅ 확장자 없을 때 기본 png
    return `fitting_${timestamp}_${random}.${extension}`;
};

/* =================================================================== */
/*  컴포넌트                                                            */
/* =================================================================== */
export default function FashnImageSidebar({
    onGenerate,
    isLoading,
    slot1Image,
    slot2Image,
}: EditImageSidebarProps) {
    const [settings, setSettings] = useState<EditImageSettings>(DEFAULT_SETTINGS);

    /* slot1 / slot2 변경 시 settings 에 반영 */
    useEffect(() => {
        setSettings(prev => ({
            ...prev,
            slot1: slot1Image ? { url: slot1Image.url, name: slot1Image.name } : undefined,
            slot2: slot2Image ? { url: slot2Image.url, name: slot2Image.name } : undefined,
        }));
    }, [slot1Image, slot2Image]);

    /* -------------------------------------------------------------- */
    /*  각종 핸들러                                                   */
    /* -------------------------------------------------------------- */
    const handleCategoryChange = (value: string) =>
        setSettings(prev => ({ ...prev, category: value }));

    const handleGarmentPhotoTypeChange = (value: string) =>
        setSettings(prev => ({ ...prev, garment_photo_type: value }));

    const handleGuidanceScaleChange = (value: number[]) =>
        setSettings(prev => ({ ...prev, guidance_scale: value[0] }));   // ✅ prev 유지

    const handleSeedChange = (value: string) =>
        setSettings(prev => ({ ...prev, seed: parseInt(value) || 42 }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!settings.slot1) return toast.error("1번(의류) 이미지를 선택해주세요");
        if (!settings.slot2) return toast.error("2번(모델) 이미지를 선택해주세요");

        try {
            /* 1. 크레딧 차감 ------------------------------------------------ */
            await BillingService.consumeCredit({ amount: 5, reason: "가상 피팅 사용" });

            /* 2. 고유 파일명 생성 ------------------------------------------- */
            const uniqueFileName = generateUniqueFileName(settings.slot1.name);

            /* 3. 실행 */
            onGenerate({ ...settings, output_filename: uniqueFileName });
        } catch {
            toast.error("크레딧이 부족합니다. 크레딧을 충전해주세요.");
        }
    };

    /* 이미지 미리보기 */
    const DisplaySlotImage = ({
        label,
        image,
    }: {
        label: string;
        image?: { url: string; name: string };
    }) => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-white">{label}</label>
            {image ? (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <Image
                        src={image.url}
                        alt={image.name}
                        fill
                        sizes="(max-width: 400px) 100vw"
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

    /* =============================================================== */
    /*  JSX                                                            */
    /* =============================================================== */
    return (
        <div className="w-[400px] h-full bg-black/90 backdrop-blur-xl border-r border-white/20 flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-10">
            {/* 내용 스크롤 */}
            <ScrollArea className="flex-1">
                <div className="p-6">
                    <form id="edit-form" onSubmit={handleSubmit} className="space-y-5">

                        {/* 의류 / 모델 이미지 미리보기 */}
                        <div className="space-y-4">
                            <DisplaySlotImage label="1번 의류 이미지" image={settings.slot1} />
                            <DisplaySlotImage label="2번 모델 이미지" image={settings.slot2} />
                        </div>

                        {/* -------------------------------------------------------- */}
                        {/*  기본 옵션                                               */}
                        {/* -------------------------------------------------------- */}
                        <div className="space-y-4 mt-6">
                            {/* 카테고리 */}
                            <div className="space-y-2">
                                <Label>의류 카테고리</Label>
                                <select
                                    value={settings.category}
                                    onChange={e => handleCategoryChange(e.target.value)}
                                    className="w-full rounded-lg border border-white/20 bg-black/30 p-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
                                >
                                    {CATEGORY_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {settings.category === "auto" && (
                                    <p className="text-xs text-gray-400">
                                        {CATEGORY_OPTIONS.find(o => o.value === "auto")?.description}
                                    </p>
                                )}
                            </div>

                            {/* 생성 모드 */}
                            <div className="space-y-2">
                                <Label>생성 모드</Label>
                                <select
                                    value={settings.mode}
                                    onChange={e => setSettings(prev => ({ ...prev, mode: e.target.value }))}
                                    className="w-full rounded-lg border border-white/20 bg-black/30 p-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
                                >
                                    {MODE_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400">생성 속도와 품질의 균형을 조절합니다</p>
                            </div>

                            {/* 콘텐츠 제한 */}
                            <div className="space-y-2">
                                <Label>콘텐츠 제한</Label>
                                <select
                                    value={settings.moderation_level}
                                    onChange={e => setSettings(prev => ({ ...prev, moderation_level: e.target.value }))}
                                    className="w-full rounded-lg border border-white/20 bg-black/30 p-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
                                >
                                    {MODERATION_LEVEL_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400">부적절한 콘텐츠를 필터링하는 수준을 설정합니다</p>
                            </div>

                            {/* 의류 이미지 타입 */}
                            <div className="space-y-2">
                                <Label>의류 이미지 타입</Label>
                                <select
                                    value={settings.garment_photo_type}
                                    onChange={e => handleGarmentPhotoTypeChange(e.target.value)}
                                    className="w-full rounded-lg border border-white/20 bg-black/30 p-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500/50 focus:outline-none"
                                >
                                    {GARMENT_PHOTO_TYPE_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {settings.garment_photo_type === "auto" && (
                                    <p className="text-xs text-gray-400">
                                        {GARMENT_PHOTO_TYPE_OPTIONS.find(o => o.value === "auto")?.description}
                                    </p>
                                )}
                            </div>

                            {/* ------------------------------------------------------ */}
                            {/*  세부 설정                                             */}
                            {/* ------------------------------------------------------ */}
                            <div className="border border-white/10 rounded-lg p-4 bg-black/30 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                                    <Settings className="h-4 w-4 text-sky-500" /> 세부 설정
                                </h3>

                                <div className="space-y-4">
                                    {/* 세그멘테이션 */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="segmentation_free"
                                                checked={settings.segmentation_free}
                                                onCheckedChange={checked =>
                                                    setSettings(prev => ({ ...prev, segmentation_free: checked }))}
                                            />
                                            <Label htmlFor="segmentation_free">세그멘테이션 비활성화</Label>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            모델 이미지의 인물 분석을 비활성화합니다
                                        </p>
                                    </div>

                                    {/* 시드값 */}
                                    <div className="space-y-2">
                                        <Label htmlFor="seed">시드값</Label>
                                        <Input
                                            id="seed"
                                            type="number"
                                            value={settings.seed}
                                            onChange={e => handleSeedChange(e.target.value)}
                                            placeholder="42 (기본값)"
                                            className="border-white/20 bg-black/30 text-white placeholder:text-gray-400"
                                        />
                                        <p className="text-xs text-gray-400">
                                            같은 시드값을 사용하면 비슷한 결과가 나옵니다
                                        </p>
                                    </div>

                                    {/* 생성 수 */}
                                    <div className="space-y-2">
                                        <Label htmlFor="num_samples">생성 수</Label>
                                        <Input
                                            id="num_samples"
                                            type="number"
                                            min={1}
                                            max={4}
                                            value={settings.num_samples}
                                            onChange={e =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    num_samples: parseInt(e.target.value) || 1,
                                                }))
                                            }
                                            placeholder="1 (기본값)"
                                            className="border-white/20 bg-black/30 text-white placeholder:text-gray-400"
                                        />
                                        <p className="text-xs text-gray-400">한 번에 생성할 이미지의 수 (1-4)</p>
                                    </div>

                                    {/* Guidance Scale - Slider */}
                                    <div className="space-y-2">
                                        <Label>Guidance Scale</Label>
                                        <Slider
                                            min={1}
                                            max={20}
                                            step={0.5}
                                            defaultValue={[settings.guidance_scale ?? 7.5]}
                                            onValueChange={handleGuidanceScaleChange}
                                        />
                                        <p className="text-xs text-gray-400">
                                            프롬프트 반영 강도 (현재 {settings.guidance_scale})
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </ScrollArea>

            {/* ------------------------------------------------------------ */}
            {/*  하단 버튼                                                    */}
            {/* ------------------------------------------------------------ */}
            <div className="p-3 border-t border-white/10 bg-black/30 backdrop-blur-md">
                <Button
                    type="submit"
                    form="edit-form"
                    disabled={isLoading}
                    className="w-full py-3 bg-sky-500/30 hover:bg-sky-500/40 text-white transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/20 hover:border-sky-500/50 hover:scale-[1.02] font-medium text-base relative"
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 가상 피팅 중...
                        </span>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            가상 피팅하기
                            <span className="absolute right-3 text-sm text-red-400">-5 크레딧</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
