import {AccountApi_Login, Request_LoginAccount} from "../../../../shared/api";
import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "../../../modules/AccountModule";
import {validateString} from "@intuitionrobotics/ts-common/validator/validator";

class ServerApi_Account_Login
    extends ServerApi<AccountApi_Login> {

    constructor() {
        super(HttpMethod.POST, "login");
        this.setBodyValidator({
                email: validateString(),
                password: validateString(),
                frontType: undefined
            }
        )
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_LoginAccount) {
        this.assertProperty(body, ["email", "password"]);

        return AccountModule.login(body, response);
    }
}

module.exports = new ServerApi_Account_Login();
