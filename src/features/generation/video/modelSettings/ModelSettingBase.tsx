// modelSettings/ModelSettingBase.tsx
import React from "react";
import { Info } from "lucide-react";
import { ModelSettingProps } from "@/types/modelSettingTypes";

export abstract class ModelSettingBase {
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
