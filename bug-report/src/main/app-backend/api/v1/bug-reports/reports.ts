
import {
	ApiResponse,
	dispatch_queryRequestInfo,
	ExpressRequest,
	ServerApi_Post,
} from "@intuitionrobotics/thunderstorm/backend";
import {
	ApiBugReport,
	BugReportModule,
	Request_BugReport
} from "./_imports";

// import {AccountModule} from "@intuitionrobotics/user-account/backend";

class ServerApi_SendReport
	extends ServerApi_Post<ApiBugReport> {

	constructor() {
		super("report");
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_BugReport) {
		const resp = await dispatch_queryRequestInfo.dispatchModuleAsync(request);
		const userId: string | undefined = resp.find(e => e.key === 'AccountsModule')?.data?.email || resp.find(e => e.key === 'RemoteProxy')?.data;

		return await BugReportModule.saveFile(body, userId);
	}
}

module.exports = new ServerApi_SendReport();
