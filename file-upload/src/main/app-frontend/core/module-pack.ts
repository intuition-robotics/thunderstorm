import {UploaderModule} from "../modules/UploaderModule";
import {Frontend_ModulePack_PushPubSub} from "@intuitionrobotics/push-pub-sub/app-frontend/core/module-pack";

export const Frontend_ModulePack_Uploader = [
    ...Frontend_ModulePack_PushPubSub,
    UploaderModule
];
