
import {UploaderModule} from "../modules/UploaderModule";
import {UploaderTempFileModule} from "../modules/UploaderTempFileModule";
import {BucketListener} from "../modules/BucketListener";
import {Backend_ModulePack_PushPubSub} from "@intuitionrobotics/push-pub-sub/app-backend/core/module-pack";
import {ServerUploaderModule} from "../modules/ServerUploaderModule";

export const Backend_ModulePack_Uploader = [
    ...Backend_ModulePack_PushPubSub,
    ServerUploaderModule,
    UploaderModule,
    UploaderTempFileModule,
    BucketListener
];
