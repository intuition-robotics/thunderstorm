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
import * as React from 'react';
import {BaseComponent} from "@intuitionrobotics/thunderstorm/frontend";
import {
	_setTimeout,
	Second
} from '@intuitionrobotics/ts-common';
import {ExampleModule} from "@modules/ExampleModule";
import {
	NotificationsModule,
	OnNotificationsReceived
} from "@intuitionrobotics/push-pub-sub/frontend";
import {DB_Notifications} from "@intuitionrobotics/push-pub-sub/shared/types";

export type State = {
	notifications: DB_Notifications[]
}

export class Example_TriggerPush
	extends BaseComponent<{}, State>
	implements OnNotificationsReceived {

	constructor(props: {}) {
		super(props);
		this.state = {
			notifications: []
		};
	}

	__onNotificationsReceived(): void {
		this.setState({notifications: NotificationsModule.getNotifications()});
	}

	render() {
		return <div className={'ll_h_v'}>
			<button onClick={() => this.triggerPush()}>Trigger Push</button>
			<button onClick={() => this.triggerPush(Second)}>Trigger Delayed Push</button>
			{this.state.notifications.map(_notification => <div onClick={() => NotificationsModule.updateReadNotification(_notification, !_notification.read)}>{_notification.read.toString()}</div>)}
		</div>;
	}

	private triggerPush(timeout?: number) {
		return _setTimeout(() => {
			ExampleModule.testPush();
		}, timeout);
	}
}
