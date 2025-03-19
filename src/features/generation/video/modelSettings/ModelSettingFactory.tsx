import { ModelSettingBase } from "./ModelSettingBase";
import { KlingModelSetting } from "./KlingModelSetting";
import { WanModelSetting } from "./WanModelSetting";
import { HunyuanModelSetting } from "./HunyuanModelSetting";
import { Veo2ModelSetting } from "./Veo2ModelSetting";

export class ModelSettingFactory {
  static getModelSetting(modelType: string): ModelSettingBase {
    switch (modelType) {
      case "kling":
        return new KlingModelSetting();
      case "wan":
        return new WanModelSetting();
      case "hunyuan":
        return new HunyuanModelSetting();
      case "veo2":
        return new Veo2ModelSetting();
      default:
        return new KlingModelSetting();
    }
  }
}
