import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";

import {HttpMethod, QueryParams} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "@intuitionrobotics/user-account/app-backend/modules/AccountModule";
import {PermissionsApi_AssignAppPermissions, Request_AssignAppPermissions} from "../../../../../shared/apis";
import {UserPermissionsDB} from "../../../../modules/db-types/assign";


class ServerApi_UserUrlsPermissions
    extends ServerApi<PermissionsApi_AssignAppPermissions> {

    constructor() {
        super(HttpMethod.POST, "app-permissions");
        this.dontPrintResponse();
    }

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: QueryParams, body: Request_AssignAppPermissions) {
		// TODO add to the request body the api that wants to use this feature.. in order to assert user permissions to perform an action
		// TODO and save our ass from a potential application security bugs
		const account = await AccountModule.validateSession(request, this.getScopes(), response);

        let assignAppPermissions;
        if (body.appAccountId)
            // when creating project
            assignAppPermissions = {...body, granterUserId: body.appAccountId, sharedUserIds: [account._id]};
        else
            // when I share with you
            assignAppPermissions = {...body, granterUserId: account._id, sharedUserIds: body.sharedUserIds};

        await UserPermissionsDB.assignAppPermissions(assignAppPermissions, request);
    }
}

module.exports = new ServerApi_UserUrlsPermissions();
