import {Logger} from "@intuitionrobotics/ts-common/core/logger/Logger";
import {FirebaseType_Messaging, FirebaseType_Unsubscribe} from "./types";
import {getToken, GetTokenOptions, MessagePayload, NextFn, Observer, onMessage} from "firebase/messaging";

export class MessagingWrapper
	extends Logger {

	private readonly messaging: FirebaseType_Messaging;
	private callback?: NextFn<MessagePayload> | Observer<MessagePayload>;
	private token?: string;

	constructor(messaging: FirebaseType_Messaging) {
		super();
		this.messaging = messaging;
	}

	async getToken(options?: GetTokenOptions): Promise<string> {
		this.token = await getToken(this.messaging,options);
		if (this.callback)
			this.onMessage(this.callback);

		return this.token;
	}

	onMessage(callback: NextFn<MessagePayload> | Observer<MessagePayload>): FirebaseType_Unsubscribe | void {
		this.callback = callback;
		if (!this.token)
			return;

		return onMessage(this.messaging, callback);
	}
}
