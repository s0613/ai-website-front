import { ReactNode } from "react";

// 공통 타입 정의
export type AspectRatioType = "16:9" | "9:16" | "1:1" | "auto" | "auto_prefer_portrait";
export type DurationType = "5s" | "6s" | "7s" | "8s" | "10s";
export type ResolutionType = "480p" | "720p";
export type CameraControlType = "down_back" | "forward_up" | "right_turn_forward" | "left_turn_forward";

// 기본 모델 설정 인터페이스
export interface BaseModelSettings {
    aspectRatio?: AspectRatioType;
    resolution?: ResolutionType;
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
    framesPerSecond?: 8 | 16 | 24;
    numInferenceSteps?: 20 | 30 | 40;
    enableSafetyChecker?: boolean;
    enablePromptExpansion?: boolean;
}

// 이미지-비디오 Kling 모델 설정
export interface ImageKlingModelSettings extends BaseModelSettings {
    duration?: "5s" | "10s";
    cameraControl?: CameraControlType;
}

// 이미지-비디오 Veo2 모델 설정
export interface ImageVeo2ModelSettings extends BaseModelSettings {
    duration?: DurationType;
    enableSafetyChecker?: boolean;
}

// 텍스트-비디오 Veo2 모델 설정
export interface TextVeo2ModelSettings extends BaseModelSettings {
    duration?: DurationType;
}

// 비디오-비디오 Hunyuan 모델 설정
export interface VideoHunyuanModelSettings extends BaseModelSettings {
    numFrames?: number;
    numInferenceSteps?: 20 | 30 | 40;
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

export interface VideoSidebarFormData {
    prompt: string;
    endpoint: string;
    video?: File;
    videoUrl?: string;
    settings: ModelSettings;
}

export interface ModelSettingComponentProps {
    settings: ModelSettingProps;
    renderDescription: (description: string) => ReactNode;
} 