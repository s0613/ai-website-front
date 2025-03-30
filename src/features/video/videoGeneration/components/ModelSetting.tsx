// components/ModelSetting.tsx
"use client";

import React from "react";
import { ModelSettingFactory } from "../modelSettings/ModelSettingFactory";

interface ModelSettingComponentProps {
  endpoint: string;
  updateSettings: (settings) => void;
  currentSettings;
}

export default function ModelSetting({
  endpoint,
  updateSettings,
  currentSettings,
}: ModelSettingComponentProps) {
  const modelSetting = ModelSettingFactory.getModelSetting(endpoint);

  return (
    <div className="space-y-3">
      {modelSetting.renderSettings({ updateSettings, currentSettings })}
    </div>
  );
}
