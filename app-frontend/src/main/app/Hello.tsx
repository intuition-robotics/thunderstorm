/*
 * A typescript & react boilerplate with api call example
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

import * as React from "react";
import {
	ExampleModule,
	RequestKey_GetApi,
	RequestKey_PostApi,
} from "@modules/ExampleModule";
import {
	BaseComponent,
	ForceUpgrade
} from "@intuitionrobotics/thunderstorm/frontend";
import {AdminBR} from "@intuitionrobotics/bug-report/frontend";
import {OnRequestListener} from "@intuitionrobotics/thunderstorm";

export class Hello
	extends BaseComponent<{}, { label: string }>
	implements OnRequestListener {

	constructor(props: any) {
		super(props);
		this.state = {
			label: "Hello World"
		};
	}

	render() {
		return <>
			<div className="ll_h_c"><h1 onClick={ExampleModule.getMessageFromServer1}>{this.state.label}</h1></div>
			<div className="ll_h_c"><h1 onClick={() => console.log("onclick")} onDoubleClick={ExampleModule.getMessageFromServer2}>Double click me</h1></div>
			<div className="ll_h_c"><h1 onClick={() => console.log("onClick")} onDoubleClick={() => console.log("onDoubleClick")}>Click OR Double Click</h1></div>
			<div className="ll_h_c"><h1 onClick={ForceUpgrade.compareVersion}>Assert version</h1></div>
			<div>
				<AdminBR/>
			</div>
		</>;
	}

	__onRequestCompleted = (key: string, success: boolean) => {
		if (!success)
			return;

		switch (key) {
			default:
				return;

			case RequestKey_GetApi:
			case RequestKey_PostApi:
				this.setState({label: ExampleModule.getMessage()});
		}
	};
}
