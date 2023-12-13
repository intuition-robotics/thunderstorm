
import {
	ApiResponse,
	ExpressRequest,
	ServerApi,
	RemoteProxy
} from "@intuitionrobotics/thunderstorm/backend";
import {
	PermissionsApi_UsersCFsByShareGroups,
	Request_UsersCFsByShareGroups,
	PermissionsModule
} from "../permissions/_imports";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";

export class ServerApi_UsersCFsByShareGroups
	extends ServerApi<PermissionsApi_UsersCFsByShareGroups> {

	constructor() {
		super(HttpMethod.POST, "users-cf-by-share-groups");
		this.dontPrintResponse();
		this.setMiddlewares(RemoteProxy.Middleware);
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_UsersCFsByShareGroups) {
		return PermissionsModule.getUsersCFsByShareGroups(body.usersEmails, body.groupsIds);
	}
}

module.exports = new ServerApi_UsersCFsByShareGroups();
