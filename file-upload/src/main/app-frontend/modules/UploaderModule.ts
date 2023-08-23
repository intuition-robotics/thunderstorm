import {BaseUploaderFile, fileUploadedKey, Push_FileUploaded, TempSecureUrl, UploadResult} from "../../shared/types";
import {BaseUploaderModule_Class, FileStatus, OnFileStatusChanged} from "../../shared/modules/BaseUploaderModule";
import {
	XhrHttpModule,
	XhrHttpModule_Class
} from "@intuitionrobotics/thunderstorm/app-frontend/modules/http/XhrHttpModule";
import {
	OnPushMessageReceived,
	PushPubSubModule
} from "@intuitionrobotics/push-pub-sub/app-frontend/modules/PushPubSubModule";
import {ThunderDispatcher} from "@intuitionrobotics/thunderstorm/app-frontend/core/thunder-dispatcher";
import {Second, timeout} from "@intuitionrobotics/ts-common/utils/date-time-tools";
import {DB_Notifications} from "@intuitionrobotics/push-pub-sub/shared/types";

export class UploaderModule_Class
    extends BaseUploaderModule_Class<XhrHttpModule_Class>
    implements OnPushMessageReceived<Push_FileUploaded> {

    protected readonly dispatch_fileStatusChange = new ThunderDispatcher<OnFileStatusChanged, "__onFileStatusChanged">("__onFileStatusChanged");

    constructor() {
        super(XhrHttpModule, 'UploaderModule');
    }

    protected dispatchFileStatusChange(id?: string) {
        this.dispatch_fileStatusChange.dispatchUI([id]);
        super.dispatchFileStatusChange(id);
    }

    upload(files: File[], key?: string, _public?: boolean): BaseUploaderFile[] {
        return this.uploadImpl(files.map((file => {
            return {
                name: file.name,
                mimeType: file.type,
                key,
                file,
                public: _public
            };
        })));
    }

    protected async subscribeToPush(toSubscribe: TempSecureUrl[]): Promise<void> {
        PushPubSubModule.subscribeMulti(toSubscribe.map(r => ({
            pushKey: fileUploadedKey,
            props: {feId: r.tempDoc.feId}
        })));
        await timeout(Second);
    }

    __onMessageReceived(notification: DB_Notifications): void {
        this.logInfo("Message received from service worker", notification.pushKey, notification.props, notification.data);
        if (notification.pushKey !== fileUploadedKey)
            return;

        switch (notification.data.result) {
            case UploadResult.Success:
                this.setFileInfo(notification.props?.feId as string, "status", FileStatus.Completed);
                break;
            case UploadResult.Failure:
                this.setFileInfo(notification.props?.feId as string, "status", FileStatus.Error);
                break;
        }

        PushPubSubModule.unsubscribe({pushKey: fileUploadedKey, props: notification.props});
    }
}

export const UploaderModule = new UploaderModule_Class();
