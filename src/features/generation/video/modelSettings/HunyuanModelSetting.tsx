// modelSettings/HunyuanModelSetting.tsx
import React from "react";
import { ModelSettingBase } from "./ModelSettingBase";
import { ModelSettingProps } from "@/types/modelSettingTypes";

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

        {this.renderDescription(
          "텐센트의 고급 이미지 투 비디오 변환. 고품질 비디오 생성 제공"
        )}
      </>
    );
  }
}
