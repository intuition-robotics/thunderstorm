import {AccountApi_Create, Request_CreateAccount} from "../../../../shared/api";
import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "../../../modules/AccountModule";

class ServerApi_Account_Create
    extends ServerApi<AccountApi_Create> {

    constructor() {
        super(HttpMethod.POST, "create");
        this.dontPrintResponse();
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_CreateAccount) {
        this.assertProperty(body, ["password", "email"]);

        return AccountModule.create(body, response);
    }
}

module.exports = new ServerApi_Account_Create();
