
import {
	ApiException,
	ApiResponse,
	ServerApi
} from "@intuitionrobotics/thunderstorm/backend";
import {
	AccountModule,
	AccountApi_Logout,
	Header_SessionId
} from "./_imports";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/backend";

class ServerApi_Account_Logout
	extends ServerApi<AccountApi_Logout> {

	constructor() {
		super(HttpMethod.POST, "logout");
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: {}) {
		const sessionId = Header_SessionId.get(request);
		if (!sessionId)
			throw new ApiException(404, 'Missing sessionId');

		return AccountModule.logout(sessionId);
	}
}

module.exports = new ServerApi_Account_Logout();
