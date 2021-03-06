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


// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
// import * as firebase from 'firebase/app';
import {
	__stringify,
	Module,
	StringMap
} from '@intuitionrobotics/ts-common';
import {FirebaseModule} from "@intuitionrobotics/firebase/frontend";
import {swSelf} from "@intuitionrobotics/thunderstorm/core/self";

export const Command_SwToApp = 'SwToApp';

type PushPubSubConfig = {
	publicKeyBase64: string
}

class PushPubSubModule_Class
	extends Module<PushPubSubConfig> {

	constructor() {
		super('Service Worker PushPubSubModule');
	}

	protected init(): void {
		this.runAsync('Init App', this.initApp);
	}

	private initApp = async () => {
		this.logDebug('SW: Initiating app');
		const app = await FirebaseModule.createSwSession();
		this.logDebug('SW: app session', app);
		const messaging = app.getMessaging();
		this.logDebug('SW: messaging wrapper', messaging);
		messaging.onBackgroundMessage((payload: any) => {
			this.runAsync(`Sending message to window ${__stringify(payload.data, true)}`, async () => this.sendMessage(payload.data));
		});
	};


	getClients = async () => swSelf.clients.matchAll({type: "window", includeUncontrolled: true});

	sendMessage = async (data: StringMap) => {
		const clients = await this.getClients();

		const message = {
			command: Command_SwToApp,
			message: data
		};

		clients.forEach(function (client) {
			client.postMessage(message);
		});
	};

	handleMessageFromClient(event: ExtendableMessageEvent) {
		// @ts-ignore
		const respondToEvent = (e: MessageEvent, message: any) => {
			e.ports[0].postMessage(message);
		};
	}
}

export const PushPubSubModule = new PushPubSubModule_Class();

