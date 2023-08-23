import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "@intuitionrobotics/user-account/app-backend/modules/AccountModule";
import {PermissionsApi_UsersCFsByShareGroups, Request_UsersCFsByShareGroups} from "../../../../shared/apis";
import {PermissionsModule} from "../../../modules/PermissionsModule";

class ServerApi_UsersCFsByShareGroups
    extends ServerApi<PermissionsApi_UsersCFsByShareGroups> {

    constructor() {
        super(HttpMethod.POST, "users-cf-by-share-groups");
        this.dontPrintResponse();
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_UsersCFsByShareGroups) {
        await AccountModule.validateSession(request, response);
        return PermissionsModule.getUsersCFsByShareGroups(body.usersEmails, body.groupsIds);
    }
}

module.exports = new ServerApi_UsersCFsByShareGroups();
