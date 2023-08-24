import {
	FirebaseType_BatchResponse,
	FirebaseType_Message,
	FirebaseType_PushMessages,
	FirebaseType_SubscriptionResponse,
	FirebaseType_TopicResponse
} from "./types";
import {FirebaseBaseWrapper} from "../auth/FirebaseBaseWrapper";
import {FirebaseSession} from "../auth/firebase-session";
import {StringMap} from "@intuitionrobotics/ts-common/utils/types";
import {getMessaging} from "firebase-admin/messaging";

export class PushMessagesWrapper
	extends FirebaseBaseWrapper {

	private readonly messaging: FirebaseType_PushMessages;

	constructor(firebaseSession: FirebaseSession<any, any>) {
		super(firebaseSession);
		this.messaging = getMessaging(firebaseSession.app)
	}

	async send(message: FirebaseType_Message, dryRun?: boolean): Promise<string> {
		return this.messaging.send(message, dryRun);
	}

	async sendAll(messages: FirebaseType_Message[]): Promise<FirebaseType_BatchResponse> {
		return this.messaging.sendEach(messages);
	}

	async sendMultiCast(tokens: string[], data: StringMap): Promise<FirebaseType_BatchResponse> {
		return this.messaging.sendEachForMulticast({data, tokens});
	}

	async sendToTopic(topic: string, data: StringMap, dryRun?: boolean): Promise<FirebaseType_TopicResponse> {
		return this.messaging.sendToTopic(topic, {data}, {dryRun})
	}

	async subscribeToTopic(tokens: string[], topic: string): Promise<FirebaseType_SubscriptionResponse> {
		return this.messaging.subscribeToTopic(tokens, topic)
	}

	async unsubscribeFromTopic(tokens: string[], topic: string): Promise<FirebaseType_SubscriptionResponse> {
		return this.messaging.unsubscribeFromTopic(tokens, topic)
	}
}
