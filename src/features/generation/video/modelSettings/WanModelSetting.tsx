// modelSettings/WanModelSetting.tsx
import React from "react";
import { ModelSettingBase } from "./ModelSettingBase";
import { ModelSettingProps } from "../types/modelSettingTypes";

export class WanModelSetting extends ModelSettingBase {
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
                className={`flex items-center justify-between w-full py-2 px-3 rounded-lg border cursor-pointer text-xs transition-transform duration-200 transform hover:scale-105 ${
                  currentSettings.aspectRatio === ratio
                    ? "border-blue-600 shadow-md"
                    : "border-gray-300"
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
                {ratio === "16:9" && (
                  <div
                    className={`w-3 h-2 border bg-transparent ${
                      currentSettings.aspectRatio === "16:9"
                        ? "border-blue-600"
                        : "border-gray-400"
                    }`}
                  ></div>
                )}
                {ratio === "9:16" && (
                  <div
                    className={`w-2 h-3 border bg-transparent ${
                      currentSettings.aspectRatio === "9:16"
                        ? "border-blue-600"
                        : "border-gray-400"
                    }`}
                  ></div>
                )}
                <span>{ratio}</span>
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
