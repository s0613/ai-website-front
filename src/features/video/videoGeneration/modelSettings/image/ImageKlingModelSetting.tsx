import React from "react";
import { Info } from "lucide-react";
import { ModelSettingBase } from "../ModelSettingBase";
import { ModelSettingProps, ImageKlingModelSettings } from "../../../videoGeneration/types/modelSettingTypes";

export class ImageKlingModelSetting extends ModelSettingBase {
  renderSettings({ updateSettings, currentSettings }: ModelSettingProps) {
    const settings = currentSettings as ImageKlingModelSettings;

    return (
      <>
        <div>
          <label className="block text-xs font-medium text-white mb-1">
            비율
          </label>
          <div className="grid grid-cols-3 gap-4">
            {["16:9", "9:16", "1:1"].map((ratio) => (
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
                  onChange={() => updateSettings({ aspectRatio: ratio as "16:9" | "9:16" | "1:1" })}
                  className="sr-only"
                />
                {ratio === "16:9" && (
                  <div
                    className={`w-3 h-2 border bg-transparent ${settings.aspectRatio === "16:9"
                      ? "border-sky-500"
                      : "border-white/30"
                      }`}
                  ></div>
                )}
                {ratio === "9:16" && (
                  <div
                    className={`w-2 h-3 border bg-transparent ${settings.aspectRatio === "9:16"
                      ? "border-sky-500"
                      : "border-white/30"
                      }`}
                  ></div>
                )}
                {ratio === "1:1" && (
                  <div
                    className={`w-3 h-3 border bg-transparent ${settings.aspectRatio === "1:1"
                      ? "border-sky-500"
                      : "border-white/30"
                      }`}
                  ></div>
                )}
                <span>{ratio}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-white mb-1">
            길이
          </label>
          <div className="grid grid-cols-4 gap-1">
            {["5s", "10s"].map((dur) => (
              <label
                key={dur}
                className={`flex items-center justify-center py-1 rounded border cursor-pointer text-xs ${settings.duration === dur
                  ? "bg-sky-500/20 border-sky-500 text-sky-500"
                  : "border-white/10 text-gray-300 hover:bg-white/5"
                  }`}
              >
                <input
                  type="radio"
                  name="duration"
                  value={dur}
                  checked={settings.duration === dur}
                  onChange={(e) => updateSettings({ duration: e.target.value as "5s" | "10s" })}
                  className="sr-only"
                />
                {dur}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-white mb-1">
            해상도
          </label>
          <div className="p-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg">
            <p className="text-xs text-gray-300">
              1080p
            </p>
          </div>
        </div>
        {this.renderDescription(
          "빠른 이미지 투 비디오 변환. 다이나믹한 움직임과 생생한 색감 표현에 최적화되어 1080p로 제작됩니다."
        )}
      </>
    );
  }
}
