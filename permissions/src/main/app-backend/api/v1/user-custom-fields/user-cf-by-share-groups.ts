
import {
	ApiResponse,
	ExpressRequest,
	ServerApi
} from "@intuitionrobotics/thunderstorm/backend";
import {
	PermissionsApi_UserCFsByShareGroups,
	Request_UserCFsByShareGroups
} from "../permissions/_imports";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";
import {AccountModule} from "@intuitionrobotics/user-account/backend";
import {PermissionsModule} from "../../../modules/PermissionsModule";

export class ServerApi_UserCFsByShareGroups
	extends ServerApi<PermissionsApi_UserCFsByShareGroups> {

	constructor() {
		super(HttpMethod.POST, "user-cf-by-share-groups");
		this.dontPrintResponse();
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_UserCFsByShareGroups) {
		const account = await AccountModule.validateSession(request, this.getScopes(), response);
		return PermissionsModule.getUserCFsByShareGroups(account._id, body.groupsIds);
	}
}

module.exports = new ServerApi_UserCFsByShareGroups();
