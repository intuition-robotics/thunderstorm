/*
 * ts-common is the basic building blocks of our typescript projects
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

import {ApiResponse, ExpressRequest, ServerApi, Storm} from "@intuitionrobotics/thunderstorm/backend";

// noinspection ES6PreferShortImport
import {PermissionsApi_RegisterProject} from "../permissions/_imports";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";
import {PermissionsModule} from "../../../modules/PermissionsModule";

export class ServerApi_RegisterProject
    extends ServerApi<PermissionsApi_RegisterProject> {

    constructor() {
        super(HttpMethod.GET, "register-project");
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void): Promise<void> {
        // RemoteProxy.assertSecret(request);
        await PermissionsModule.registerProject(Storm.getInstance().getHttpServer());
    }
}

module.exports = new ServerApi_RegisterProject();
