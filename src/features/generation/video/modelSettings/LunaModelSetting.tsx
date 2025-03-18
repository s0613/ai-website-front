// modelSettings/LunaModelSetting.tsx
import React from "react";
import { ModelSettingBase } from "./ModelSettingBase";
import { ModelSettingProps } from "@/types/modelSettingTypes";

export class LunaModelSetting extends ModelSettingBase {
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
