
import {
	ApiResponse,
	ExpressRequest,
	ServerApi_Get,
} from "@intuitionrobotics/thunderstorm/backend";
import {
	AdminBRModule,
	ApiGetLog
} from "./_imports";

class ServerApi_GetReport
	extends ServerApi_Get<ApiGetLog> {

	constructor() {
		super("get-logs");
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void) {
		return AdminBRModule.getFilesFirebase();
	}
}

module.exports = new ServerApi_GetReport();
