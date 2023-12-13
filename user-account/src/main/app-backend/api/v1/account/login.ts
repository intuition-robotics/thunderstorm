
import {
	ApiResponse,
	ServerApi
} from "@intuitionrobotics/thunderstorm/backend";


import {
	AccountModule,
	AccountApi_Login,
	Request_LoginAccount
} from "./_imports";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/backend";

class ServerApi_Account_Login
	extends ServerApi<AccountApi_Login> {

	constructor() {
		super(HttpMethod.POST, "login");
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_LoginAccount) {
		this.assertProperty(body, ["email", "password"]);

		return AccountModule.login(body, response);
	}
}

module.exports = new ServerApi_Account_Login();
