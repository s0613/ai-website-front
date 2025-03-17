"use client";

import React from "react";
import { Info } from "lucide-react";

// 모델 설정 공통 인터페이스
interface ModelSettingProps {
  updateSettings: (settings: any) => void;
  currentSettings: any;
}

// 각 모델별 설정 컴포넌트의 기본 클래스
abstract class ModelSettingBase {
  abstract renderSettings(props: ModelSettingProps): React.ReactNode;

  // 모델 설명 표시 헬퍼 메소드
  renderDescription(description: string) {
    return (
      <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700">{description}</p>
      </div>
    );
  }
}

// Luna 모델 설정
class LunaModelSetting extends ModelSettingBase {
  renderSettings({ updateSettings, currentSettings }: ModelSettingProps) {
    return (
      <>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            비율
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["16:9", "9:16"].map((ratio) => (
              <label
                key={ratio}
                className={`flex items-center justify-center py-1.5 rounded border cursor-pointer text-xs ${
                  currentSettings.aspectRatio === ratio
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="aspectRatio"
                  value={ratio}
                  checked={currentSettings.aspectRatio === ratio}
                  onChange={(e) =>
                    updateSettings({ aspectRatio: e.target.value })
                  }
                  className="sr-only"
                />
                {ratio}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            길이
          </label>
          <div className="grid grid-cols-4 gap-1">
            {["5s", "6s", "7s", "8s"].map((dur) => (
              <label
                key={dur}
                className={`flex items-center justify-center py-1 rounded border cursor-pointer text-xs ${
                  currentSettings.duration === dur
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="duration"
                  value={dur}
                  checked={currentSettings.duration === dur}
                  onChange={(e) => updateSettings({ duration: e.target.value })}
                  className="sr-only"
                />
                {dur}
              </label>
            ))}
          </div>
        </div>
        {this.renderDescription(
          "고품질 이미지 투 비디오 변환. 자연스러운 움직임과 세부 표현이 뛰어남"
        )}
      </>
    );
  }
}

// Kling 모델 설정
class KlingModelSetting extends ModelSettingBase {
  renderSettings({ updateSettings, currentSettings }: ModelSettingProps) {
    const cameraControlDescriptions: Record<string, string> = {
      down_back: "아래에서 뒤로 움직이는 시점",
      forward_up: "앞에서 위로 움직이는 시점",
      right_turn_forward: "오른쪽에서 앞으로 회전하는 시점",
      left_turn_forward: "왼쪽에서 앞으로 회전하는 시점",
    };

    return (
      <>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            비율
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["16:9", "9:16", "1:1"].map((ratio) => (
              <label
                key={ratio}
                className={`flex items-center justify-center py-1.5 rounded border cursor-pointer text-xs ${
                  currentSettings.aspectRatio === ratio
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="aspectRatio"
                  value={ratio}
                  checked={currentSettings.aspectRatio === ratio}
                  onChange={(e) =>
                    updateSettings({ aspectRatio: e.target.value })
                  }
                  className="sr-only"
                />
                {ratio}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            길이
          </label>
          <div className="grid grid-cols-4 gap-1">
            {["5s", "10s"].map((dur) => (
              <label
                key={dur}
                className={`flex items-center justify-center py-1 rounded border cursor-pointer text-xs ${
                  currentSettings.duration === dur
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="duration"
                  value={dur}
                  checked={currentSettings.duration === dur}
                  onChange={(e) => updateSettings({ duration: e.target.value })}
                  className="sr-only"
                />
                {dur}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            카메라 움직임
          </label>
          <select
            value={currentSettings.cameraControl || "down_back"}
            onChange={(e) => updateSettings({ cameraControl: e.target.value })}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="down_back">아래에서 뒤로</option>
            <option value="forward_up">앞에서 위로</option>
            <option value="right_turn_forward">오른쪽에서 회전</option>
            <option value="left_turn_forward">왼쪽에서 회전</option>
          </select>
          <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              {
                cameraControlDescriptions[
                  currentSettings.cameraControl || "down_back"
                ]
              }
            </p>
          </div>
        </div>
        {this.renderDescription(
          "빠른 이미지 투 비디오 변환. 다이나믹한 움직임과 생생한 색감 표현에 최적화"
        )}
      </>
    );
  }
}

// Wan 모델 설정
class WanModelSetting extends ModelSettingBase {
  renderSettings({ updateSettings, currentSettings }: ModelSettingProps) {
    return (
      <>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            비율
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["16:9", "9:16"].map((ratio) => (
              <label
                key={ratio}
                className={`flex items-center justify-center py-1.5 rounded border cursor-pointer text-xs ${
                  currentSettings.aspectRatio === ratio
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="aspectRatio"
                  value={ratio}
                  checked={currentSettings.aspectRatio === ratio}
                  onChange={(e) =>
                    updateSettings({ aspectRatio: e.target.value })
                  }
                  className="sr-only"
                />
                {ratio}
              </label>
            ))}
          </div>
        </div>

        {/* 프레임 수 설정 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            프레임 수
          </label>
          <select
            value={currentSettings.numFrames || 81}
            onChange={(e) =>
              updateSettings({ numFrames: Number(e.target.value) })
            }
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="81">81 프레임 (기본)</option>
            <option value="90">90 프레임</option>
            <option value="100">100 프레임</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            프레임 수가 많을수록 영상이 길어집니다
          </p>
        </div>

        {/* 초당 프레임 수 (FPS) 설정 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            초당 프레임 수(FPS)
          </label>
          <select
            value={currentSettings.framesPerSecond || 16}
            onChange={(e) =>
              updateSettings({ framesPerSecond: Number(e.target.value) })
            }
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="8">8 FPS (더 느린 영상)</option>
            <option value="16">16 FPS (기본)</option>
            <option value="24">24 FPS (더 부드러운 영상)</option>
          </select>
        </div>

        {/* 해상도 설정 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            해상도
          </label>
          <select
            value={currentSettings.resolution || "720p"}
            onChange={(e) => updateSettings({ resolution: e.target.value })}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="480p">480p (더 빠른 생성)</option>
            <option value="720p">720p (더 높은 품질)</option>
          </select>
        </div>

        {/* 추론 단계 설정 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            품질 수준 (추론 단계)
          </label>
          <select
            value={currentSettings.numInferenceSteps || 30}
            onChange={(e) =>
              updateSettings({ numInferenceSteps: Number(e.target.value) })
            }
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="20">빠른 생성 (20단계)</option>
            <option value="30">균형 품질 (30단계, 기본)</option>
            <option value="40">고품질 (40단계, 더 오래 걸림)</option>
          </select>
        </div>

        {/* 시드 설정 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            시드 값 (선택사항)
          </label>
          <input
            type="number"
            value={currentSettings.seed || ""}
            onChange={(e) =>
              updateSettings({
                seed: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="랜덤 생성을 위한 시드 값"
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            동일한 시드로 비슷한 결과를 재생성할 수 있습니다
          </p>
        </div>

        {/* 안전 검사기 설정 */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentSettings.enableSafetyChecker !== false}
              onChange={(e) =>
                updateSettings({ enableSafetyChecker: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-gray-700">
              안전 검사기 활성화
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 pl-6">
            부적절한 콘텐츠 생성 방지를 위한 필터링
          </p>
        </div>

        {/* 프롬프트 확장 설정 */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentSettings.enablePromptExpansion !== false}
              onChange={(e) =>
                updateSettings({ enablePromptExpansion: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-gray-700">
              프롬프트 확장 활성화
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 pl-6">
            더 자연스러운 결과를 위해 프롬프트 개선
          </p>
        </div>

        {this.renderDescription(
          "정교한 이미지 투 비디오 변환. 세밀한 디테일과 다양한 시각적 효과를 지원"
        )}
      </>
    );
  }
}

// Hunyuan 모델 설정
class HunyuanModelSetting extends ModelSettingBase {
  renderSettings({ updateSettings, currentSettings }: ModelSettingProps) {
    return (
      <>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            비율
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["16:9", "9:16"].map((ratio) => (
              <label
                key={ratio}
                className={`flex items-center justify-center py-1.5 rounded border cursor-pointer text-xs ${
                  currentSettings.aspectRatio === ratio
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="aspectRatio"
                  value={ratio}
                  checked={currentSettings.aspectRatio === ratio}
                  onChange={(e) =>
                    updateSettings({ aspectRatio: e.target.value })
                  }
                  className="sr-only"
                />
                {ratio}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            해상도
          </label>
          <select
            value={currentSettings.resolution || "720p"}
            onChange={(e) => updateSettings({ resolution: e.target.value })}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="720p">720p</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            현재 720p 해상도만 지원됩니다
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            시드 값 (선택사항)
          </label>
          <input
            type="number"
            value={currentSettings.seed || ""}
            onChange={(e) =>
              updateSettings({
                seed: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="랜덤 생성을 위한 시드 값"
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            동일한 시드로 비슷한 결과를 재생성할 수 있습니다
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            프레임 수
          </label>
          <input
            type="number"
            value={currentSettings.numFrames || 129}
            disabled={true}
            className="w-full rounded-md border border-gray-300 p-2 text-sm bg-gray-100 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            현재 129 프레임만 지원됩니다
          </p>
        </div>
        {this.renderDescription(
          "텐센트의 고급 이미지 투 비디오 변환. 고품질 비디오 생성 제공"
        )}
      </>
    );
  }
}

// Veo2 모델 설정
class Veo2ModelSetting extends ModelSettingBase {
  renderSettings({ updateSettings, currentSettings }: ModelSettingProps) {
    return (
      <>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            비율
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["16:9", "9:16"].map((ratio) => (
              <label
                key={ratio}
                className={`flex items-center justify-center py-1.5 rounded border cursor-pointer text-xs ${
                  currentSettings.aspectRatio === ratio
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="aspectRatio"
                  value={ratio}
                  checked={currentSettings.aspectRatio === ratio}
                  onChange={(e) =>
                    updateSettings({ aspectRatio: e.target.value })
                  }
                  className="sr-only"
                />
                {ratio}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            길이
          </label>
          <div className="grid grid-cols-4 gap-1">
            {["5s", "6s", "7s", "8s"].map((dur) => (
              <label
                key={dur}
                className={`flex items-center justify-center py-1 rounded border cursor-pointer text-xs ${
                  currentSettings.duration === dur
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name="duration"
                  value={dur}
                  checked={currentSettings.duration === dur}
                  onChange={(e) => updateSettings({ duration: e.target.value })}
                  className="sr-only"
                />
                {dur}
              </label>
            ))}
          </div>
        </div>
        {this.renderDescription(
          "텍스트 프롬프트로부터 안정적인 영상 생성. 넓은 주제 범위를 커버"
        )}
      </>
    );
  }
}

// 모델 설정 팩토리 클래스
class ModelSettingFactory {
  static getModelSetting(modelType: string): ModelSettingBase {
    switch (modelType) {
      case "luna":
        return new LunaModelSetting();
      case "kling":
        return new KlingModelSetting();
      case "wan":
        return new WanModelSetting();
      case "hunyuan":
        return new HunyuanModelSetting();
      case "veo2":
        return new Veo2ModelSetting();
      default:
        return new LunaModelSetting();
    }
  }
}

// 메인 ModelSetting 컴포넌트
export default function ModelSetting({
  endpoint,
  updateSettings,
  currentSettings,
}: {
  endpoint: string;
  updateSettings: (settings: any) => void;
  currentSettings: any;
}) {
  const modelSetting = ModelSettingFactory.getModelSetting(endpoint);

  return (
    <div className="space-y-3">
      {modelSetting.renderSettings({ updateSettings, currentSettings })}
    </div>
  );
}
