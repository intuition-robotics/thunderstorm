
import {
	ApiResponse,
	ExpressRequest,
	ServerApi
} from "@intuitionrobotics/thunderstorm/backend";
import {
	AccountApi_AssertLoginSAML,
	AccountModule,
	PostAssertBody
} from "./_imports";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";


export class AssertSamlToken
	extends ServerApi<AccountApi_AssertLoginSAML> {

	constructor(pathPart: string = "assert") {
		super(HttpMethod.POST, pathPart);
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: PostAssertBody) {
		return await AccountModule.assertApi(body, response);
	}
}
