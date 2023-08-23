import {AccountApi_LoginSAML, RequestParams_LoginSAML} from "../../../../shared/api";
import {ApiResponse, ServerApi_Get} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {SamlModule} from "../../../modules/SamlModule";

class ServerApi_Account_LoginSAML
    extends ServerApi_Get<AccountApi_LoginSAML> {

    constructor() {
        super("login-saml");
        this.dontPrintResponse();
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: RequestParams_LoginSAML, body: void) {
        const loginUrl = await SamlModule.loginRequest(queryParams);
        return {loginUrl}
    }
}

module.exports = new ServerApi_Account_LoginSAML();
