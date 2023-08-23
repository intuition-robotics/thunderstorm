import {ApiResponse, ServerApi_Get} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {ApiGetLog} from "../../../../shared/api";
import {AdminBRModule} from "../../../modules/AdminBRModule";

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
