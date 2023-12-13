
import {Logger} from "@intuitionrobotics/ts-common";
import {FirebaseType_Messaging} from "./types";
import {onBackgroundMessage} from "firebase/messaging/sw";

export class SwMessagingWrapper
	extends Logger {

	private readonly messaging: FirebaseType_Messaging;

	constructor(messaging: FirebaseType_Messaging) {
		super();
		this.messaging = messaging;
	}

	onBackgroundMessage(callback: (payload: any) => void) {
		// This means that the bundle is being evaluated in the main thread to register the service worker so there is no need to run the rest
		// Also because it would fail since firebase would initialize the messaging controller as the main thread one instead of the sw one...
		if (!self || !("ServiceWorkerGlobalScope" in self))
			return this.logWarning("Not a service worker context");

		this.logInfo("This is a service worker context");
		return onBackgroundMessage(this.messaging, {
			next: callback,
			error: error => this.logWarning(error),
			complete: () => this.logInfo("Successfully set on background messaging")
		});
	}

}
