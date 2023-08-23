import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "@intuitionrobotics/user-account/app-backend/modules/AccountModule";
import {PermissionsApi_UserCFsByShareGroups, Request_UserCFsByShareGroups} from "../../../../shared/apis";
import {PermissionsModule} from "../../../modules/PermissionsModule";

class ServerApi_UserCFsByShareGroups
    extends ServerApi<PermissionsApi_UserCFsByShareGroups> {

    constructor() {
        super(HttpMethod.POST, "user-cf-by-share-groups");
        this.dontPrintResponse();
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_UserCFsByShareGroups) {
        const account = await AccountModule.validateSession(request, response);
        return PermissionsModule.getUserCFsByShareGroups(account._id, body.groupsIds);
    }
}

module.exports = new ServerApi_UserCFsByShareGroups();
