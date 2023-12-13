
import {
	ApiResponse,
	ExpressRequest,
	ServerApi
} from "@intuitionrobotics/thunderstorm/backend";

import {HttpMethod} from "@intuitionrobotics/thunderstorm";
import {
	AccountApi_ValidateSession,
	AccountModule
} from "./_imports";

class ValidateToken
	extends ServerApi<AccountApi_ValidateSession> {

	constructor() {
		super(HttpMethod.GET, "validate");
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void) {
		const {email, _id} = await AccountModule.validateSession(request, this.getScopes(), response);
		return {email, _id};
	}
}

module.exports = new ValidateToken();
