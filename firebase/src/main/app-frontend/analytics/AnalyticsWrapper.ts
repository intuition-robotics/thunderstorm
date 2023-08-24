import {Logger} from "@intuitionrobotics/ts-common/core/logger/Logger";
import {
	FirebaseType_Analytics,
	FirebaseType_CallOptions,
	FirebaseType_EventNameString
} from "./types";
// tslint:disable:no-import-side-effect
import {
	CustomParams,
	logEvent,
	setAnalyticsCollectionEnabled,
	setUserId,
	setUserProperties
} from "firebase/analytics";

export class AnalyticsWrapper
	extends Logger {

	private readonly analytics: FirebaseType_Analytics;

	constructor(analytics: FirebaseType_Analytics) {
		super();
		this.analytics = analytics;
	}

	setUserId(userId: string, options?: FirebaseType_CallOptions) {
		setUserId(this.analytics, userId, options);
	}

	setCurrentScreen(screenName: string, options?: FirebaseType_CallOptions) {
		this.logEvent("screen_view",{screenName}, options)
	}

	setAnalyticsCollectionEnabled(enabled: boolean) {
		setAnalyticsCollectionEnabled(this.analytics, enabled);
	}

	setUserProperties(properties: CustomParams, options?: FirebaseType_CallOptions) {
		setUserProperties(this.analytics, properties);
	}

	logEvent<T extends string>(
		eventName: FirebaseType_EventNameString | string,
		eventParams?: { [key: string]: any },
		options?: FirebaseType_CallOptions
	) {
		return logEvent(this.analytics, eventName, eventParams, options);
	}

}
