import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "@intuitionrobotics/user-account/app-backend/modules/AccountModule";
import {PermissionsApi_UserUrlsPermissions, Request_UserUrlsPermissions} from "../../../../shared/apis";
import {PermissionsModule} from "../../../modules/PermissionsModule";

class ServerApi_UserUrlsPermissions
    extends ServerApi<PermissionsApi_UserUrlsPermissions> {

    constructor() {
        super(HttpMethod.POST, "user-urls-permissions");
        this.dontPrintResponse();
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_UserUrlsPermissions) {
        const account = await AccountModule.validateSession(request, response);
        return PermissionsModule.getUserUrlsPermissions(body.projectId, body.urls, account._id, body.requestCustomField);
    }
}

module.exports = new ServerApi_UserUrlsPermissions();
