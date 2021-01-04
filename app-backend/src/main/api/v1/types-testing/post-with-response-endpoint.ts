/*
 * A backend boilerplate with example apis
 *
 * Copyright (C) 2020 Adam van der Kruk aka TacB0sS
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
	ApiResponse,
	ServerApi_Post,
} from "@ir/thunderstorm/backend";


import {
	ApiType_ApiPostWithResponse,
	CommonBodyReq
} from "@app/app-shared";
import {ExpressRequest} from "@ir/thunderstorm/backend";

class ServerApi_EndpointExample
	extends ServerApi_Post<ApiType_ApiPostWithResponse> {

	constructor() {
		super("post-with-response-endpoint");
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: CommonBodyReq) {
		this.logInfoBold(`got id: ${body.message}`);
		return "needs to return a string";
	}
}

module.exports = new ServerApi_EndpointExample();
