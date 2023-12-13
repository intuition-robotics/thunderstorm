
import {
	ApiResponse,
	ServerApi
} from "@intuitionrobotics/thunderstorm/backend";


import {
	AccountModule,
	AccountApi_Create,
	Request_CreateAccount
} from "./_imports";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/backend";

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
