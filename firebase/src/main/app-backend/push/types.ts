import * as admin from "firebase-admin";

type BaseMessage = {
	data?: { [key: string]: string };
	notification?: admin.messaging.Notification;
	android?: admin.messaging.AndroidConfig;
	webpush?: admin.messaging.WebpushConfig;
	apns?: admin.messaging.ApnsConfig;
	fcmOptions?: admin.messaging.FcmOptions;
};

type TokenMessage = BaseMessage & {
	token: string;
}

export type FirebaseType_PushMessages = admin.messaging.Messaging;
// export type FirebaseType_Message = admin.messaging.Message;
export type FirebaseType_Message = TokenMessage
export type FirebaseType_BatchResponse = admin.messaging.BatchResponse
export type FirebaseType_TopicResponse = admin.messaging.MessagingTopicResponse;
export type FirebaseType_MulticastMessage = admin.messaging.MulticastMessage;
export type FirebaseType_SubscriptionResponse = admin.messaging.MessagingTopicManagementResponse;
