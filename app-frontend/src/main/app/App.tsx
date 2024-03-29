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

import * as React from 'react';
import {
	BaseComponent,
	Dialog,
	PopupMenu,
	RoutingModule,
	Toaster,
	WrapperProps
} from "@intuitionrobotics/thunderstorm/frontend";

import {VersionOnScreen} from './components/VersionOnScreen';
import {
	AccountModule,
	OnLoginStatusUpdated
} from "@intuitionrobotics/user-account/frontend";
import {registerRoutes} from "./Routes";
import {BugReport} from '@intuitionrobotics/bug-report/frontend';

export class App
	extends BaseComponent<WrapperProps>
	implements OnLoginStatusUpdated {

	public static dropBlocker<T>(ev: React.DragEvent<T>) {
		ev.preventDefault();
		ev.stopPropagation();
	};

	onLoginStatusUpdated = () => {
		const status = AccountModule.getLoggedStatus();
		console.log('status update', status);
	};

	render() {
		registerRoutes();
		return (
			<div onDrop={App.dropBlocker} onDragOver={App.dropBlocker}>
				<BugReport>
					{RoutingModule.getRoutesMap()}
				</BugReport>
				<VersionOnScreen/>
				<Dialog/>
				<Toaster/>
				<PopupMenu/>
			</div>);
	}
}

