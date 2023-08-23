import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types"
import {RemoteProxy} from "@intuitionrobotics/thunderstorm/app-backend/modules/proxy/RemoteProxy";
import {PermissionsModule} from "../../../modules/PermissionsModule";
import {PermissionsApi_RegisterExternalProject, Request_RegisterProject} from "../../../../shared/apis";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";


export class ServerApi_RegisterExternalProject
    extends ServerApi<PermissionsApi_RegisterExternalProject> {

    constructor() {
        super(HttpMethod.POST, "register-external-project");
        this.setMiddlewares(RemoteProxy.Middleware)
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_RegisterProject): Promise<void> {
        await PermissionsModule._registerProject(body);
    }
}

module.exports = new ServerApi_RegisterExternalProject();
