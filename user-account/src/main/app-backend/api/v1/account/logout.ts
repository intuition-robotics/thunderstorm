import {AccountApi_Logout} from "../../../../shared/api";
import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule, Header_SessionId} from "../../../modules/AccountModule";
import {ApiException} from "@intuitionrobotics/thunderstorm/app-backend/exceptions";

class ServerApi_Account_Logout
    extends ServerApi<AccountApi_Logout> {

    constructor() {
        super(HttpMethod.POST, "logout");
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: {}) {
        const sessionId = Header_SessionId.get(request);
        if (!sessionId)
            throw new ApiException(404, 'Missing sessionId');

        return AccountModule.logout(sessionId);
    }
}

module.exports = new ServerApi_Account_Logout();
