import {AccountApi_ListAccounts, UI_Account} from "../../../../shared/api";
import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {AccountModule} from "../../../modules/AccountModule";

class ListAccounts
    extends ServerApi<AccountApi_ListAccounts> {

    constructor() {
        super(HttpMethod.GET, "query");
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void) {
        const accounts: UI_Account[] = await AccountModule.listUsers();
        return {accounts}
    }
}

module.exports = new ListAccounts();
