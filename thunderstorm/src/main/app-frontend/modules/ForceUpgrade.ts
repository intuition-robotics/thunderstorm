/*
 * Thunderstorm is a full web app framework!
 *
 * Typescript & Express backend infrastructure that natively runs on firebase function
 * Typescript & React frontend infrastructure
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
	Module,
	Dispatcher
} from "@intuitionrobotics/ts-common";
import {XhrHttpModule} from "./http/XhrHttpModule";
import {
	ApiBinder_AssertAppVersion,
	HeaderKey_PlatformVersion,
	HeaderKey_PlatformName,
	UpgradeRequired
} from "../../shared/force-upgrade";
import {HttpMethod} from "../../shared/types";
import {browserType} from "../utils/tools";

export const RequestKey_AssertAppVersion = "assert-app-version";
type Config = {
	assertVersionUrl: string
}

export interface OnUpgradeRequired {
	__onUpgradeRequired(response: UpgradeRequired): void;
}

const dispatch_onUpgradeRequired = new Dispatcher<OnUpgradeRequired, "__onUpgradeRequired">("__onUpgradeRequired");

class ForceUpgrade_Class
	extends Module<Config> {

	constructor() {
		super("ForceUpgrade");
	}

	protected init(): void {
		XhrHttpModule.addDefaultHeader(HeaderKey_PlatformVersion, `${process.env.appVersion}`);
		XhrHttpModule.addDefaultHeader(HeaderKey_PlatformName, `${browserType()}`);
	}

	compareVersion = () => {
		XhrHttpModule
			.createRequest<ApiBinder_AssertAppVersion>(HttpMethod.GET, RequestKey_AssertAppVersion)
			.setRelativeUrl(this.config.assertVersionUrl)
			.execute((response: UpgradeRequired) => {
				dispatch_onUpgradeRequired.dispatchModule(response);
			});
	};
}

export const ForceUpgrade = new ForceUpgrade_Class();
