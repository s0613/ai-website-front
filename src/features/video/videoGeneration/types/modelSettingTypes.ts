import { ReactNode } from "react";

// 기본 모델 설정 인터페이스
export interface BaseModelSettings {
    aspectRatio?: string;
    resolution?: string;
    seed?: number;
}

// 이미지-비디오 Hunyuan 모델 설정
export interface ImageHunyuanModelSettings extends BaseModelSettings {
    numFrames?: number;
    i2vStability?: boolean;
}

// 이미지-비디오 Wan 모델 설정
export interface ImageWanModelSettings extends BaseModelSettings {
    numFrames?: number;
    framesPerSecond?: number;
    numInferenceSteps?: number;
    enableSafetyChecker?: boolean;
    enablePromptExpansion?: boolean;
}

// 이미지-비디오 Kling 모델 설정
export interface ImageKlingModelSettings extends BaseModelSettings {
    duration?: string;
    cameraControl?: string;
}

// 이미지-비디오 Veo2 모델 설정
export interface ImageVeo2ModelSettings extends BaseModelSettings {
    duration?: string;
    enableSafetyChecker?: boolean;
}

// 텍스트-비디오 Veo2 모델 설정
export interface TextVeo2ModelSettings extends BaseModelSettings {
    duration?: string;
}

// 비디오-비디오 Hunyuan 모델 설정
export interface VideoHunyuanModelSettings extends BaseModelSettings {
    numFrames?: number;
    numInferenceSteps?: number;
    proMode?: boolean;
    enableSafetyChecker?: boolean;
}

// 통합 모델 설정 타입
export type ModelSettings =
    | ImageHunyuanModelSettings
    | ImageWanModelSettings
    | ImageKlingModelSettings
    | ImageVeo2ModelSettings
    | TextVeo2ModelSettings
    | VideoHunyuanModelSettings;

export interface ModelSettingProps {
    updateSettings: (settings: Partial<ModelSettings>) => void;
    currentSettings: ModelSettings;
}

export interface VideoSidebarFormData extends ModelSettings {
    prompt: string;
    endpoint: string;
    video?: File;
    videoUrl?: string;
}

export interface ModelSettingComponentProps {
    settings: ModelSettingProps;
    renderDescription: (description: string) => ReactNode;
} 