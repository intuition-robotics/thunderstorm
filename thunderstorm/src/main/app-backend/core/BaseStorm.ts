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
	DatabaseWrapper,
	FirebaseModule
} from "@intuitionrobotics/firebase/backend";
import {
	merge,
	ModuleManager,
	ObjectTS
} from "@intuitionrobotics/ts-common";

export abstract class BaseStorm
	extends ModuleManager {

	protected envKey: string = "dev";
	private override: ObjectTS = {};

	setEnvironment(envKey: string) {
		this.envKey = envKey;
		return this;
	}

	setOverride(override?: ObjectTS) {
		if (override && typeof override === "object" && Object.keys(override).length !== 0)
			this.override = override
		return this;
	}

	protected resolveConfig = async () => {
		const database: DatabaseWrapper = FirebaseModule.createAdminSession().getDatabase();
		let initialized = 0;

		const listener = (resolve: (value?: ObjectTS) => void) => (snapshot?: ObjectTS) => {
			if (initialized > 1) {
				console.log("CONFIGURATION HAS CHANGED... KILLING PROCESS!!!");
				process.exit(2);
			}

			resolve(snapshot || {});

			initialized++;
		};

		const defaultPromise = new Promise((resolve) => {
			database.listen(`/_config/default`, listener(resolve));
		});
		const envPromise = new Promise((resolve) => {
			database.listen(`/_config/${this.envKey}`, listener(resolve));
		});
		const [
			      defaultConfig,
			      envConfig
		      ] = await Promise.all(
			[
				defaultPromise,
				envPromise
			]
		);

		let toBeConfig: ObjectTS = merge(defaultConfig || {}, envConfig || {});
		if(this.config)
			toBeConfig = merge(this.config, toBeConfig)

		if(this.override)
			toBeConfig = merge(toBeConfig, this.override)

		this.setConfig(toBeConfig);
	};
}
