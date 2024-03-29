/*
 * Permissions management system, define access level for each of
 * your server apis, and restrict users by giving them access levels
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

/**
 * Created by tacb0ss on 19/09/2018.
 */
import {FirebaseApp} from "firebase/app";
// tslint:disable:no-import-side-effect
import "firebase/auth";
import {Logger} from "@intuitionrobotics/ts-common";
// noinspection TypeScriptPreferShortImport
import {SwMessagingWrapper} from "../messaging/SwMessagingWrapper";
import {getMessaging} from "firebase/messaging";


export class SwFirebaseSession
	extends Logger {
	app!: FirebaseApp;

	protected sessionName: string;
	protected messaging?: SwMessagingWrapper;

	constructor(sessionName: string, app: FirebaseApp) {
		super(`service worker firebase: ${sessionName}`);

		this.sessionName = sessionName;
		this.app = app;
	}

	getMessaging() {
		if (this.messaging)
			return this.messaging;

		return this.messaging = new SwMessagingWrapper(getMessaging(this.app));
	}
}

