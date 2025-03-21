// modelSettings/Veo2ModelSetting.tsx
import React from "react";
import { ModelSettingBase } from "./ModelSettingBase";
import { ModelSettingProps } from "../types/modelSettingTypes";

export class Veo2ModelSetting extends ModelSettingBase {
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
