import {ApiResponse, ServerApi_Post} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {ApiPostPath, Paths} from "../../../../shared/api";
import {AdminBRModule} from "../../../modules/AdminBRModule";

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
