
import {
	ApiResponse,
	ServerApi_Get
} from "@intuitionrobotics/thunderstorm/backend";


import {
	AccountApi_LoginSAML,
	RequestParams_LoginSAML,
	SamlModule
} from "./_imports";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/backend";

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
