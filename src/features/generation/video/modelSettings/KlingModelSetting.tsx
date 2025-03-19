import React from "react";
import { Info } from "lucide-react";
import { ModelSettingBase } from "./ModelSettingBase";
import { ModelSettingProps } from "../types/modelSettingTypes";

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
          <label className="block text-xs font-medium text-gray-700 mb-1">
            비율
          </label>
          <div className="grid grid-cols-3 gap-4">
            {["16:9", "9:16", "1:1"].map((ratio) => (
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
                  onChange={() => updateSettings({ aspectRatio: ratio })}
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
                {ratio === "1:1" && (
                  <div
                    className={`w-3 h-3 border bg-transparent ${
                      currentSettings.aspectRatio === "1:1"
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
        <div className="mt-4">
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
        <div className="mt-4">
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
