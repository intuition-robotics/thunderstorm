import {FirebaseScheduledFunction} from "@intuitionrobotics/firebase/app-backend/functions/firebase-function";
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
