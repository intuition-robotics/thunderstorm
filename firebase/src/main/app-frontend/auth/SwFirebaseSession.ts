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

