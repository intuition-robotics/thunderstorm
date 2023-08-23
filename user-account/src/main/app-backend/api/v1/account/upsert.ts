import {AccountApi_Upsert, Request_UpsertAccount} from "../../../../shared/api";
import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {RemoteProxy} from "@intuitionrobotics/thunderstorm/app-backend/modules/proxy/RemoteProxy";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "../../../modules/AccountModule";
import {validateExists} from "@intuitionrobotics/ts-common/validator/validator";

class ServerApi_Account_Upsert
    extends ServerApi<AccountApi_Upsert> {

    constructor() {
        super(HttpMethod.POST, "upsert");
        this.setMiddlewares(RemoteProxy.Middleware);
        this.setBodyValidator({password: validateExists(), email: validateExists(), password_check: undefined});
        this.dontPrintResponse();
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_UpsertAccount) {
        return AccountModule.upsert(body);
    }
}

module.exports = new ServerApi_Account_Upsert();
