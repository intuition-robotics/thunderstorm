import {Firebase_StorageFunction} from "@intuitionrobotics/firebase/app-backend/functions/firebase-function";
import {ObjectMetadata} from "firebase-functions/lib/v1/providers/storage";
import {EventContext} from "firebase-functions";
import {Dispatcher} from "@intuitionrobotics/ts-common/core/dispatcher";

export interface OnFileUploaded {
    __onFileUploaded(filePath?: string): void;
}

const dispatcher_onFileUploaded = new Dispatcher<OnFileUploaded, "__onFileUploaded">("__onFileUploaded");


export class BucketListener_Class
    extends Firebase_StorageFunction {
    constructor() {
        super("BucketListener");
    }


    init() {
        super.init();
        // @ts-ignore
        this.logInfo("Bucket Listener config", this.config)
        this.logInfo("bucketName", this.config.bucketName);
    }

    async onFinalize(object: ObjectMetadata, context: EventContext): Promise<any> {
        const filePath = object.name;
        await dispatcher_onFileUploaded.dispatchModuleAsync([filePath]);
        this.logInfo("Object is ", object);
        this.logInfo("Context is ", context);
    }

}

export const BucketListener = new BucketListener_Class();
