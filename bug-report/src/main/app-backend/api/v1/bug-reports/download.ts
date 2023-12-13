
import {
	ApiResponse,
	ExpressRequest,
	ServerApi_Post
} from "@intuitionrobotics/thunderstorm/backend";
import {
	AdminBRModule,
	ApiPostPath,
	Paths
} from "./_imports";

class ServerApi_DownloadLogs
	extends ServerApi_Post<ApiPostPath> {

	constructor() {
		super("download-logs");
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Paths) {
		return AdminBRModule.downloadFiles(body);
	}
}

module.exports = new ServerApi_DownloadLogs();
