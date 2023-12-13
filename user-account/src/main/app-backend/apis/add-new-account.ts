
import {
	ApiResponse,
	ServerApi
} from "@intuitionrobotics/thunderstorm/backend";
import {
	AccountModule,
	Request_AddNewAccount,
	AccountApi_AddNewAccount
} from "../api/v1/account/_imports";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/backend";

export class ServerApi_Account_AddNewAccount
	extends ServerApi<AccountApi_AddNewAccount> {

	constructor() {
		super(HttpMethod.POST, "add-new-account");
		this.dontPrintResponse();
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_AddNewAccount) {
		this.assertProperty(body, ["email"]);

		return AccountModule.addNewAccount(body.email, body.password, body.password_check);
	}
}
