/*
 * A backend boilerplate with example apis
 *
 * Copyright (C) 2020 Intuition Robotics
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
	ServerApi_Get,
} from "@intuitionrobotics/thunderstorm/backend";


import {DispatchModule} from "@modules/ExampleModule";
import {ExampleGetMax} from "@app/app-shared";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/backend";

class ServerApi_EndpointExample
	extends ServerApi_Get<ExampleGetMax> {

	constructor() {
		super("get-max");
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void) {
		return DispatchModule.getMax()
	}
}

module.exports = new ServerApi_EndpointExample();


