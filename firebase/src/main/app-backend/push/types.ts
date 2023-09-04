import {
    AndroidConfig,
    ApnsConfig,
    FcmOptions,
    Messaging,
    MessagingTopicManagementResponse,
    MessagingTopicResponse,
    MulticastMessage,
    Notification,
    WebpushConfig,
    BatchResponse
} from "firebase-admin/messaging";

type BaseMessage = {
    data?: { [key: string]: string };
    notification?: Notification;
    android?: AndroidConfig;
    webpush?: WebpushConfig;
    apns?: ApnsConfig;
    fcmOptions?: FcmOptions;
};

type TokenMessage = BaseMessage & {
    token: string;
}

export type FirebaseType_PushMessages = Messaging;
export type FirebaseType_Message = TokenMessage
export type FirebaseType_BatchResponse = BatchResponse
export type FirebaseType_TopicResponse = MessagingTopicResponse;
export type FirebaseType_MulticastMessage = MulticastMessage;
export type FirebaseType_SubscriptionResponse = MessagingTopicManagementResponse;
