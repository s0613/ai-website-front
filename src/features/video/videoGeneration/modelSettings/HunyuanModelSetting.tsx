// modelSettings/HunyuanModelSetting.tsx
import React from "react";
import { ModelSettingBase } from "./ModelSettingBase";
import { ModelSettingProps } from "../../types/modelSettingTypes";

export class HunyuanModelSetting extends ModelSettingBase {
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

        {this.renderDescription(
          "텐센트의 고급 이미지 투 비디오 변환. 고품질 비디오 생성 제공"
        )}
      </>
    );
  }
}
