// modelSettings/image/ImageWanModelSetting.tsx
import React from "react";
import { ModelSettingBase } from "../ModelSettingBase";
import { ModelSettingProps, ImageWanModelSettings } from "../../types/modelSettingTypes";

export class ImageWanModelSetting extends ModelSettingBase {
  renderSettings({ updateSettings, currentSettings }: ModelSettingProps): React.ReactNode {
    const settings = currentSettings as ImageWanModelSettings;

    return (
      <div className="space-y-4">
        {this.renderDescription(
          "정교한 이미지 투 비디오 변환. 세밀한 디테일과 다양한 시각적 효과를 지원"
        )}

        {/* 비율 설정 */}
        <div>
          <label className="block text-xs font-medium text-white mb-1">
            비율
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["16:9", "9:16"].map((ratio) => (
              <label
                key={ratio}
                className={`flex items-center justify-between w-full py-2 px-3 rounded-lg border cursor-pointer text-xs transition-transform duration-200 transform hover:scale-105 ${settings.aspectRatio === ratio
                  ? "border-sky-500 bg-sky-500/20 text-sky-500"
                  : "border-white/10 text-gray-300 hover:bg-white/5"
                  }`}
              >
                <input
                  type="radio"
                  name="aspectRatio"
                  value={ratio}
                  checked={settings.aspectRatio === ratio}
                  onChange={(e) =>
                    updateSettings({ aspectRatio: e.target.value })
                  }
                  className="sr-only"
                />
                {ratio === "16:9" ? (
                  <div
                    className={`w-3 h-2 border ${settings.aspectRatio === "16:9"
                      ? "border-sky-500"
                      : "border-white/30"
                      }`}
                  />
                ) : (
                  <div
                    className={`w-2 h-3 border ${settings.aspectRatio === "9:16"
                      ? "border-sky-500"
                      : "border-white/30"
                      }`}
                  />
                )}
                <span>{ratio}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 프레임 수 설정 */}
        <div>
          <label className="block text-xs font-medium text-white mb-1">
            프레임 수
          </label>
          <select
            value={settings.numFrames || 81}
            onChange={(e) =>
              updateSettings({ numFrames: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-white/10 bg-black/30 backdrop-blur-md p-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="81">81 프레임 (기본)</option>
            <option value="90">90 프레임</option>
            <option value="100">100 프레임</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            프레임 수가 많을수록 영상이 길어집니다
          </p>
        </div>

        {/* 초당 프레임 수 (FPS) 설정 */}
        <div>
          <label className="block text-xs font-medium text-white mb-1">
            초당 프레임 수(FPS)
          </label>
          <select
            value={settings.framesPerSecond || 16}
            onChange={(e) =>
              updateSettings({ framesPerSecond: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-white/10 bg-black/30 backdrop-blur-md p-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="8">8 FPS (더 느린 영상)</option>
            <option value="16">16 FPS (기본)</option>
            <option value="24">24 FPS (더 부드러운 영상)</option>
          </select>
        </div>

        {/* 해상도 설정 */}
        <div>
          <label className="block text-xs font-medium text-white mb-1">
            해상도
          </label>
          <select
            value={settings.resolution || "720p"}
            onChange={(e) => updateSettings({ resolution: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 backdrop-blur-md p-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="480p">480p (더 빠른 생성)</option>
            <option value="720p">720p (더 높은 품질)</option>
          </select>
        </div>

        {/* 추론 단계 설정 */}
        <div>
          <label className="block text-xs font-medium text-white mb-1">
            품질 수준 (추론 단계)
          </label>
          <select
            value={settings.numInferenceSteps || 30}
            onChange={(e) =>
              updateSettings({ numInferenceSteps: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-white/10 bg-black/30 backdrop-blur-md p-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="20">빠른 생성 (20단계)</option>
            <option value="30">균형 품질 (30단계, 기본)</option>
            <option value="40">고품질 (40단계, 더 오래 걸림)</option>
          </select>
        </div>

        {/* 시드 설정 */}
        <div>
          <label className="block text-xs font-medium text-white mb-1">
            시드 값 (선택사항)
          </label>
          <input
            type="number"
            value={settings.seed || ""}
            onChange={(e) =>
              updateSettings({
                seed: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="랜덤 생성을 위한 시드 값"
            className="w-full rounded-lg border border-white/10 bg-black/30 backdrop-blur-md p-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            동일한 시드로 비슷한 결과를 재생성할 수 있습니다
          </p>
        </div>

        {/* 안전 검사기 설정 */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableSafetyChecker !== false}
              onChange={(e) =>
                updateSettings({ enableSafetyChecker: e.target.checked })
              }
              className="rounded border-white/10 text-sky-500 focus:ring-sky-500 bg-black/30"
            />
            <span className="text-xs font-medium text-white">
              안전 검사기 활성화
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-1 pl-6">
            부적절한 콘텐츠 생성 방지를 위한 필터링
          </p>
        </div>

        {/* 프롬프트 확장 설정 */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enablePromptExpansion !== false}
              onChange={(e) =>
                updateSettings({ enablePromptExpansion: e.target.checked })
              }
              className="rounded border-white/10 text-sky-500 focus:ring-sky-500 bg-black/30"
            />
            <span className="text-xs font-medium text-white">
              프롬프트 확장 활성화
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-1 pl-6">
            더 자연스러운 결과를 위해 프롬프트 개선
          </p>
        </div>
      </div>
    );
  }
}
