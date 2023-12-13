
import {
	BaseUploaderFile,
	TempSecureUrl,
    Request_Uploader
} from "../../shared/types";
import {
	BaseUploaderModule_Class,
} from "../../shared/modules/BaseUploaderModule";
import {
	Axios_RequestConfig,
	AxiosHttpModule,
	AxiosHttpModule_Class
} from "@intuitionrobotics/thunderstorm/backend";

export type ServerFilesToUpload = Request_Uploader & {
	file: Buffer
}

export class ServerUploaderModule_Class
	extends BaseUploaderModule_Class<AxiosHttpModule_Class, { requestConfig: Axios_RequestConfig }> {

	constructor() {
		super(AxiosHttpModule, "ServerUploaderModule");
	}

	init() {
		super.init();
		AxiosHttpModule.setRequestOption(this.config.requestConfig);
	}

	upload(files: ServerFilesToUpload[]): BaseUploaderFile[] {
		return this.uploadImpl(files);
	}

	protected async subscribeToPush(toSubscribe: TempSecureUrl[]): Promise<void> {
		// Not sure now
		// We said timeout
	}
}

export const ServerUploaderModule = new ServerUploaderModule_Class();




