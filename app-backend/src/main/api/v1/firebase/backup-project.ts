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
	ServerApi,
	ApiResponse
} from "@nu-art/thunderstorm/backend";

import {
	HttpMethod,
	ApiWithQuery
} from "@nu-art/thunderstorm";
import * as express from "express";
import {ProjectFirestoreBackup} from "@nu-art/firebase/backend-firestore-backup";


class ServerApi_RegisterExternalProject
	extends ServerApi<ApiWithQuery<string, void>> {

	constructor() {
		super(HttpMethod.GET, "backup-project");
	}

	protected async process(request: express.Request, response: ApiResponse, queryParams: {}, body: void) {
		this.logInfo("backup started");
		try {
			await ProjectFirestoreBackup.backupProject();
		} catch (e) {
			this.logError("backup error", e);
			console.log(e);
		}
		this.logInfo("backup ended");
	}
}

module.exports = new ServerApi_RegisterExternalProject();