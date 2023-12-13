
import {
	ApiResponse,
	ExpressRequest,
	ServerApi
} from "@intuitionrobotics/thunderstorm/backend";
import {
	AccountApi_ListAccounts,
	AccountModule,
    UI_Account
} from "./_imports";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";


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
