
import {FirebaseScheduledFunction} from "@intuitionrobotics/firebase/backend-functions";
import {PushPubSubModule} from "./PushPubSubModule";

export class ScheduledCleanup_Class
	extends FirebaseScheduledFunction {

	constructor() {
		super("ScheduledCleanup");
		this.setSchedule('every 1 hours');
	}

	onScheduledEvent = async (): Promise<any> => {
		return PushPubSubModule.scheduledCleanup()
	};
}

export const ScheduledCleanup = new ScheduledCleanup_Class();
