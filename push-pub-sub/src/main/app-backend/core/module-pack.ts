import {PushPubSubModule} from "../modules/PushPubSubModule";
import {ScheduledCleanup} from "../modules/ScheduledPushCleanup";

export const Backend_ModulePack_PushPubSub = [
    PushPubSubModule,
    ScheduledCleanup
];
