import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {Storm} from "@intuitionrobotics/thunderstorm/app-backend/core/Storm";
import {PermissionsApi_RegisterProject} from "../../../../shared/apis";
import {PermissionsModule} from "../../../modules/PermissionsModule";

export class ServerApi_RegisterProject
    extends ServerApi<PermissionsApi_RegisterProject> {

    constructor() {
        super(HttpMethod.GET, "register-project");
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void): Promise<void> {
        await PermissionsModule.registerProject(Storm.getInstance().getHttpServer());
    }
}

module.exports = new ServerApi_RegisterProject();
