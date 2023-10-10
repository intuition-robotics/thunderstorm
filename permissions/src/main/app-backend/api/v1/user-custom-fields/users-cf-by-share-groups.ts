import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {RemoteProxy} from "@intuitionrobotics/thunderstorm/app-backend/modules/proxy/RemoteProxy";
import {PermissionsApi_UsersCFsByShareGroups, Request_UsersCFsByShareGroups} from "../../../../shared/apis";
import {PermissionsModule} from "../../../modules/PermissionsModule";

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
