import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "@intuitionrobotics/user-account/app-backend/modules/AccountModule";
import {PermissionsApi_AssertUserAccess, Request_AssertApiForUser} from "../../../../shared/apis";
import {PermissionsAssert} from "../../../modules/permissions-assert";

class ServerApi_AssertPermissions
    extends ServerApi<PermissionsApi_AssertUserAccess> {

    constructor() {
        super(HttpMethod.POST, "assert-user-access");
        this.dontPrintResponse();
    }

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_AssertApiForUser) {
		const account = await AccountModule.validateSession(request, this.getScopes(), response);
		await PermissionsAssert.assertUserPermissions(body.projectId, body.path, account._id, body.requestCustomField);
		return account;
	}
}

module.exports = new ServerApi_AssertPermissions();
