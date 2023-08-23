import {PushPubSubModule} from "../modules/PushPubSubModule";
import {FirebaseModule} from "@intuitionrobotics/firebase/app-frontend/FirebaseModule";
import {NotificationsModule} from "../modules/NotificationModule";

export const Frontend_ModulePack_PushPubSub = [
    FirebaseModule,
    PushPubSubModule,
    NotificationsModule
];
