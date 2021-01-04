import {ThunderDispatcher} from "@ir/thunderstorm/app-frontend/core/thunder-dispatcher";
import {
	Module,
	removeItemFromArray
} from "@ir/ts-common";
import {DB_Notifications} from "../..";
import {PushPubSubModule} from "./PushPubSubModule";


export interface OnNotificationsUpdated {
	__onNotificationsUpdated(): void
}

export const dispatch_NotificationsUpdated = new ThunderDispatcher<OnNotificationsUpdated, '__onNotificationsUpdated'>('__onNotificationsUpdated');


export class NotificationsModule_Class
	extends Module {

	private notifications: DB_Notifications[] = [];

	getNotifications() {
		return this.notifications;
	}

	setNotificationList = (notifications: DB_Notifications[]) => {
		this.notifications = notifications;
	};

	addNotification(newNotification: DB_Notifications) {
		this.notifications.push(newNotification);
		dispatch_NotificationsUpdated.dispatchUI([]);
	}

	removeNotification(notification: DB_Notifications){
		removeItemFromArray(this.notifications, notification)
		return notification._id
	}

	updateReadNotification = async (notification: DB_Notifications, read: boolean) => {
		const readNotification = this.notifications.find(_notification => _notification._id === notification._id);
		if (!readNotification || !readNotification.persistent)
			return;

		readNotification.read = read;
		await PushPubSubModule.readNotification(notification._id, read);
	};

}

export const NotificationsModule = new NotificationsModule_Class();