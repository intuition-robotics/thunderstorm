
import {PushPubSubModule} from "../modules/PushPubSubModule";
import {FirebaseModule} from "@intuitionrobotics/firebase/frontend";
import {NotificationsModule} from "../modules/NotificationModule";

export const Frontend_ModulePack_PushPubSub = [
	FirebaseModule,
	PushPubSubModule,
	NotificationsModule
];

export * from "../modules/PushPubSubModule";
export * from "../modules/NotificationModule";
