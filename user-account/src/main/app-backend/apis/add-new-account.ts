import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {validateString} from "@intuitionrobotics/ts-common/validator/validator";
import {AccountApi_AddNewAccount, Request_AddNewAccount} from "../../shared/api";
import {AccountModule} from "../modules/AccountModule";

export class ServerApi_Account_AddNewAccount
    extends ServerApi<AccountApi_AddNewAccount> {

    constructor() {
        super(HttpMethod.POST, "add-new-account");
        this.setBodyValidator({
            email: validateString(),
            password: validateString(false),
            password_check: validateString(false)
        })
        this.dontPrintResponse();
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_AddNewAccount) {
        this.assertProperty(body, ["email"]);

        return AccountModule.addNewAccount(body.email, body.password, body.password_check);
    }
}
