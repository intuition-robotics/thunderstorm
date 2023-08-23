import {AccountApi_ValidateSession} from "../../../../shared/api";
import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "../../../modules/AccountModule";

class ValidateToken
    extends ServerApi<AccountApi_ValidateSession> {

    constructor() {
        super(HttpMethod.GET, "validate");
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void) {
        const {email, _id} = await AccountModule.validateSession(request, response);
        return {email, _id};
    }
}

module.exports = new ValidateToken();
