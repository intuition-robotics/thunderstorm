import {Module} from "@intuitionrobotics/ts-common/core/module";
import {PubSub} from "@google-cloud/pubsub";
import {PublishOptions} from "@google-cloud/pubsub/build/src/topic";
import {AuthModule} from "./AuthModule";
import {GoogleAuth} from "google-auth-library";

class PubSubModule_Class
    extends Module {

    constructor() {
        super("PubSubModule");
    }

    project(projectId: string, authKey = projectId) {
        const authObject = AuthModule.getAuth(authKey, []);
        const auth: GoogleAuth = authObject.auth;

        // @ts-ignore
        const pubSub = new PubSub({projectId, auth});
        return {
            createTopic: async (topicName: string) => {
                const [topic] = await pubSub.createTopic(topicName);
                return topic;
            },
            topic: (topicName: string, options?: PublishOptions) => {
                const topic = pubSub.topic(topicName, options);
                return {
                    publishJson: async (json: object) => topic.publishMessage(json),
                    publish: async (buffer: Buffer) => topic.publishMessage({data: buffer})
                };
            }
        };
    }
}

export const PubSubModule = new PubSubModule_Class();
