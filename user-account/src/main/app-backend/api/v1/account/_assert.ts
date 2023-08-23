import {AccountApi_AssertLoginSAML, PostAssertBody} from "../../../../shared/api";
import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "../../../modules/AccountModule";

export class AssertSamlToken
    extends ServerApi<AccountApi_AssertLoginSAML> {

    constructor(pathPart: string = "assert") {
        super(HttpMethod.POST, pathPart);
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: PostAssertBody) {
        return await AccountModule.assertApi(body, response);
    }
}
