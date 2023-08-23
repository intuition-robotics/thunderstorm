import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {PermissionsApi_TestPermissions} from "../../../../shared/apis";
import {testUserPermissionsTime} from "../../../benchmark/permission-user-assert-benchmark";

class ServerApi_TestPermissions
    extends ServerApi<PermissionsApi_TestPermissions> {

    constructor() {
        super(HttpMethod.GET, "test-permissions");
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void): Promise<void> {
        console.log('Starting test permissions assert');
        await testUserPermissionsTime();
        console.log('---Finish test permissions assert---');
    }
}

module.exports = new ServerApi_TestPermissions();
