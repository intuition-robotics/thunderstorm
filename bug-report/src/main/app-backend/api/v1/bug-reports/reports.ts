import {ApiResponse, ServerApi_Post} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {dispatch_queryRequestInfo, ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {ApiBugReport, Request_BugReport} from "../../../../shared/api";
import {BugReportModule} from "../../../modules/BugReportModule";

class ServerApi_SendReport
    extends ServerApi_Post<ApiBugReport> {

    constructor() {
        super("report");
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_BugReport) {
        const resp = await dispatch_queryRequestInfo.dispatchModuleAsync([request]);
        const userId: string | undefined = resp.find(e => e.key === 'AccountsModule')?.data?.email || resp.find(e => e.key === 'RemoteProxy')?.data;

        return await BugReportModule.saveFile(body, userId);
    }
}

module.exports = new ServerApi_SendReport();
