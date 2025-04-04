import React from "react";
import { Info } from "lucide-react";
import { ModelSettingBase } from "./ModelSettingBase";
import { ModelSettingProps } from "../../types/modelSettingTypes";

export class KlingModelSetting extends ModelSettingBase {
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
          <label className="block text-xs font-medium text-white mb-1">
            비율
          </label>
          <div className="grid grid-cols-3 gap-4">
            {["16:9", "9:16", "1:1"].map((ratio) => (
              <label
                key={ratio}
                className={`flex items-center justify-between w-full py-2 px-3 rounded-lg border cursor-pointer text-xs transition-transform duration-200 transform hover:scale-105 ${currentSettings.aspectRatio === ratio
                    ? "border-sky-500 bg-sky-500/20 text-sky-500"
                    : "border-white/10 text-gray-300 hover:bg-white/5"
                  }`}
              >
                <input
                  type="radio"
                  name="aspectRatio"
                  value={ratio}
                  checked={currentSettings.aspectRatio === ratio}
                  onChange={() => updateSettings({ aspectRatio: ratio })}
                  className="sr-only"
                />
                {ratio === "16:9" && (
                  <div
                    className={`w-3 h-2 border bg-transparent ${currentSettings.aspectRatio === "16:9"
                        ? "border-sky-500"
                        : "border-white/30"
                      }`}
                  ></div>
                )}
                {ratio === "9:16" && (
                  <div
                    className={`w-2 h-3 border bg-transparent ${currentSettings.aspectRatio === "9:16"
                        ? "border-sky-500"
                        : "border-white/30"
                      }`}
                  ></div>
                )}
                {ratio === "1:1" && (
                  <div
                    className={`w-3 h-3 border bg-transparent ${currentSettings.aspectRatio === "1:1"
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
                className={`flex items-center justify-center py-1 rounded border cursor-pointer text-xs ${currentSettings.duration === dur
                    ? "bg-sky-500/20 border-sky-500 text-sky-500"
                    : "border-white/10 text-gray-300 hover:bg-white/5"
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
        <div className="mt-4">
          <label className="block text-xs font-medium text-white mb-1">
            카메라 움직임
          </label>
          <select
            value={currentSettings.cameraControl || "down_back"}
            onChange={(e) => updateSettings({ cameraControl: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/30 backdrop-blur-md p-2 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="down_back">아래에서 뒤로</option>
            <option value="forward_up">앞에서 위로</option>
            <option value="right_turn_forward">오른쪽에서 회전</option>
            <option value="left_turn_forward">왼쪽에서 회전</option>
          </select>
          <div className="mt-1 p-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg flex items-start gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <Info className="h-4 w-4 text-sky-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-300">
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
