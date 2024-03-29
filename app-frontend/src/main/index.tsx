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

// tslint:disable:no-import-side-effect
import './res/styles/styles.scss';

import {App} from "./app/App";
import {
	ForceUpgrade,
	Thunder
} from "@intuitionrobotics/thunderstorm/frontend";

import {ExampleModule} from "@modules/ExampleModule";
import {Frontend_ModulePack_PushPubSub} from "@intuitionrobotics/push-pub-sub/frontend";
import {BugReportModule} from "@intuitionrobotics/bug-report/frontend";
import {Module} from '@intuitionrobotics/ts-common';
import {Frontend_ModulePack_Uploader} from "@intuitionrobotics/file-upload/frontend";
import {PermissionsFE} from '@intuitionrobotics/permissions/frontend';

const modules: Module[] = [
	ForceUpgrade,
	ExampleModule,
	BugReportModule
];
PermissionsFE.setDefaultConfig({projectId: 'thunderstorm-staging'});

new Thunder()
	.setConfig(require("./config").config)
	.addModules(...Frontend_ModulePack_PushPubSub)
	.addModules(...Frontend_ModulePack_Uploader)
	.addModules(...modules)
	.setMainApp(App)
	.build();

