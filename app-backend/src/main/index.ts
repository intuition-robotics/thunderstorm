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

// tslint:disable-next-line:no-import-side-effect
import 'module-alias/register';
import * as functions from "firebase-functions";
import {Environment} from "./config";
import {Storm} from "@intuitionrobotics/thunderstorm/app-backend/core/Storm";
import {currentTimeMillies} from "@intuitionrobotics/ts-common/utils/date-time-tools";
import defaultConfig from "./defaultConfig.json"
import {ServerApi, ServerApi_Get} from '@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api';
import {RouteResolver} from '@intuitionrobotics/thunderstorm/app-backend/modules/server/HttpServer';

const vernpm_package_versionsion = process.env.npm_package_version as string;
console.log(`Starting server v${vernpm_package_versionsion} with env: ${Environment.name}`);

export class ServerApi_Health
    extends ServerApi_Get<any> {

    constructor(private readonly version: string, private readonly env: string, pathPart: string = '/health') {
        super(`${pathPart}/check`);
    }

    protected async process() {
        return {
            timestamp: currentTimeMillies(),
            version: this.version,
            env: this.env
        }
    }
}

const serverApiHealth: ServerApi<any> = new ServerApi_Health(vernpm_package_versionsion, Environment.name);
const _exports = new Storm()
    .setInitialRouteResolver(new RouteResolver(require, __dirname, "api"))
    .setInitialRoutePath("/api")
    .setEnvironment(Environment.name)
    .registerApis(serverApiHealth)
    .setConfig(defaultConfig || {})
    .build();

_exports.logTest = functions.database.ref('triggerLogs').onWrite((change, context) => {
    console.log('LOG_TEST FUNCTION! -- Logging string');
    console.log(`Changed from: ${change.before} to --> ${change.after} with context: ${JSON.stringify(context)}`);
    console.log({
        firstProps: 'String prop',
        secondProps: {
            a: 'Nested Object Prop',
            b: 10000
        }
    });
});

module.exports = _exports;
