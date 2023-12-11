import * as functions from "firebase-functions";
import {
    Change,
    CloudFunction,
    database,
    EventContext,
    firestore,
    HttpsFunction,
    RuntimeOptions
} from "firebase-functions";
import {Express, Request, Response} from "express";
import {
    __stringify,
    addItemToArray,
    deepClone,
    dispatch_onServerError,
    ImplementationMissingException,
    Module,
    ServerErrorSeverity,
    StringMap
} from "@intuitionrobotics/ts-common";
import {ObjectMetadata} from "firebase-functions/lib/v1/providers/storage";
import {Message} from "firebase-functions/lib/v1/providers/pubsub";
import DataSnapshot = database.DataSnapshot;
import DocumentSnapshot = firestore.DocumentSnapshot;

export interface FirebaseFunctionInterface {
    onDestroy: (() => Promise<void>)[]

    getFunction(): HttpsFunction;

    addOnStart(onStart: () => Promise<void>): void;

    addOnDestroy(onDestroy: () => Promise<void>): void;
}

export abstract class FirebaseFunction<Config = any>
    extends Module<Config>
    implements FirebaseFunctionInterface {
    onDestroy: (() => Promise<void>)[] = [];
    onStart: (() => Promise<void>)[] = [];

    constructor(name: string, onStart?: () => Promise<void>, onDestroy?: () => Promise<void>) {
        super(name);
        onStart && this.onStart.push(onStart);
        onDestroy && this.onDestroy.push(onDestroy);
    }

    abstract getFunction(): HttpsFunction

    public addOnStart(onStart: () => Promise<void>): void {
        this.onStart.push(onStart);
    };

    public addOnDestroy(onDestroy: () => Promise<void>): void {
        this.onDestroy.push(onDestroy);
    };

}

export class Firebase_ExpressFunction
    implements FirebaseFunctionInterface {
    private readonly express: Express;
    private function!: HttpsFunction;
    private readonly name: string;
    static config: RuntimeOptions = {};
    onDestroy: (() => Promise<void>)[] = [];
    onStart: (() => Promise<void>)[] = [];

    constructor(_express: Express, name = "api", onStart?: () => Promise<void>, onDestroy?: () => Promise<void>) {
        this.express = _express;
        this.name = name;
        onStart && this.onStart.push(onStart);
        onDestroy && this.onDestroy.push(onDestroy);
    }

    static setConfig(config: RuntimeOptions) {
        this.config = config;
    }

    public addOnStart(onStart: () => Promise<void>): void {
        this.onStart.push(onStart);
    };

    public addOnDestroy(onDestroy: () => Promise<void>): void {
        this.onDestroy.push(onDestroy);
    };

    getName() {
        return this.name;
    }

    getFunction = () => {
        if (this.function)
            return this.function;

        const runtimeOptions = {
            labels: {
                infra: "thunderstorm",
                function_name: getFormattedFunctionName(this.getName()),
                type: "https",
                version: "v1"
            },
            ...Firebase_ExpressFunction.config
        };

        return this.function = functions.runWith(runtimeOptions).https.onRequest(async (req: Request, resp: Response) => {
            try {
                for (const _onStart of this.onStart) {
                    await _onStart();
                }

                return await this.express(req, resp);
            } finally {
                for (const _onDestroy of this.onDestroy) {
                    await _onDestroy();
                }
            }
        });
    };
}


export abstract class Firebase_HttpsFunction<Config = any>
    extends FirebaseFunction<Config> {
    private function!: HttpsFunction;

    abstract process(req: Request, res: Response): Promise<any>;

    getFunction = () => {
        if (this.function)
            return this.function;

        const runtimeOptions = {
            labels: {
                infra: "thunderstorm",
                function_name: getFormattedFunctionName(this.getName()),
                type: "https",
                version: "v1"
            }
        };
        return this.function = functions.runWith(runtimeOptions).https.onRequest(async (req: Request, res: Response) => {
            try {
                for (const _onStart of this.onStart) {
                    await _onStart();
                }

                return await this.process(req, res);

            } finally {
                for (const _onDestroy of this.onDestroy) {
                    await _onDestroy();
                }
            }
        });
    };

    onFunctionReady = async () => {
        return;
    };
}

//TODO: I would like to add a type for the params..
export abstract class FirebaseFunctionModule<DataType = any, Config extends RuntimeOptsConfigs = any>
    extends FirebaseFunction<Config> {

    private readonly listeningPath: string;
    private function!: CloudFunction<Change<DataSnapshot>>;

    protected constructor(listeningPath: string, name: string, onStart?: () => Promise<void>, onDestroy?: () => Promise<void>) {
        super(name);
        this.listeningPath = listeningPath;
        onStart && this.addOnStart(onStart);
        onDestroy && this.addOnDestroy(onDestroy);
    }

    abstract processChanges(before: DataType, after: DataType, params: { [param: string]: any }): Promise<any>;

    getFunction = () => {
        if (this.function)
            return this.function;

        const runtimeOptions = {
            labels: {
                infra: "thunderstorm",
                function_name: getFormattedFunctionName(this.getName()),
                type: "realtime-db-listener",
                version: "v1"
            },
            ...this.config?.runtimeOpts
        };

        return this.function = functions.runWith(runtimeOptions).database.ref(this.listeningPath).onWrite(
            async (change: Change<DataSnapshot>, context: EventContext) => {
                try {
                    for (const _onStart of this.onStart) {
                        await _onStart();
                    }

                    const before: DataType = change.before && change.before.val();
                    const after: DataType = change.after && change.after.val();
                    const params = deepClone(context.params);

                    return await this.processChanges(before, after, params);
                } finally {
                    for (const _onDestroy of this.onDestroy) {
                        await _onDestroy();
                    }
                }
            });
    };
}

export type FirestoreConfigs = {
    runTimeOptions?: RuntimeOptions,
    configs: any
}

//TODO: I would like to add a type for the params..
export abstract class FirestoreFunctionModule<DataType extends object, Config extends FirestoreConfigs = FirestoreConfigs>
    extends FirebaseFunction<Config> {

    private readonly collectionName: string;
    private function!: CloudFunction<Change<DocumentSnapshot>>;

    protected constructor(collectionName: string, name: string, onStart?: () => Promise<void>, onDestroy?: () => Promise<void>) {
        super(name, onStart, onDestroy);
        this.collectionName = collectionName;
    }

    abstract processChanges(params: { [param: string]: any }, before?: DataType, after?: DataType): Promise<any>;

    getFunction = () => {
        if (this.function)
            return this.function;

        const runtimeOptions = {
            labels: {
                infra: "thunderstorm",
                function_name: getFormattedFunctionName(this.getName()),
                type: "firestore-listener",
                version: "v1"
            },
            ...this.config?.runTimeOptions
        };
        return this.function = functions.runWith(runtimeOptions).firestore.document(`${this.collectionName}/{docId}`).onWrite(
            async (change: Change<DocumentSnapshot>, context: EventContext) => {
                try {
                    for (const _onStart of this.onStart) {
                        await _onStart();
                    }

                    const before = change.before && change.before.data() as DataType | undefined;
                    const after = change.after && change.after.data() as DataType | undefined;
                    const params = deepClone(context.params);

                    return await this.processChanges(params, before, after);
                } finally {
                    for (const _onDestroy of this.onDestroy) {
                        await _onDestroy();
                    }
                }
            });
    };
}

export type ScheduledConfig = RuntimeOptsConfigs & {
    timeZone?: string
};

export abstract class FirebaseScheduledFunction<Config extends ScheduledConfig = any>
    extends FirebaseFunction<Config> {

    private function!: CloudFunction<Change<DataSnapshot>>;
    private schedule?: string;
    private runningCondition: (() => Promise<boolean>)[] = [];

    addRunningCondition(runningCondition: () => Promise<boolean>) {
        addItemToArray(this.runningCondition, runningCondition);
        return this;
    }

    setSchedule(schedule: string) {
        this.schedule = schedule;
        return this;
    }

    abstract onScheduledEvent(): Promise<any>;

    getFunction = () => {
        if (!this.schedule)
            throw new ImplementationMissingException("MUST set schedule !!");

        if (this.function)
            return this.function;

        const runtimeOptions = {
            labels: {
                infra: "thunderstorm",
                function_name: getFormattedFunctionName(this.getName()),
                type: "pubsub-schedule",
                version: "v1"
            },
            ...this.config?.runtimeOpts
        };
        return this.function = functions
            .runWith(runtimeOptions)
            .pubsub
            .schedule(this.schedule)
            .timeZone(this.config?.timeZone || "Etc/UTC")
            .onRun(async () => {
                try {
                    for (const _onStart of this.onStart) {
                        await _onStart();
                    }

                    const results: boolean[] = await Promise.all(this.runningCondition.map(condition => condition()));

                    if (results.includes(false)) {
                        this.logDebug("will not execute backup.. running conditions didn't pass: ", results);
                        return;
                    }

                    return await this.onScheduledEvent();
                } finally {
                    for (const _onDestroy of this.onDestroy) {
                        await _onDestroy();
                    }
                }
            });
    };
}

export type RuntimeOptsConfigs = {
    runtimeOpts?: RuntimeOptions
}

export type BucketConfigs = RuntimeOptsConfigs & {
    bucketName?: string
}

export abstract class Firebase_StorageFunction<Config extends BucketConfigs = BucketConfigs>
    extends FirebaseFunction<Config> {

    private function!: CloudFunction<ObjectMetadata>;

    abstract onFinalize(object: ObjectMetadata, context: EventContext): Promise<any>;

    getFunction = () => {
        if (this.function)
            return this.function;

        this.logInfo(`Initializing ${this.getName()} with configs ${JSON.stringify(this.config)}`)

        const runtimeOptions: RuntimeOptions = {
            labels: {
                infra: "thunderstorm",
                function_name: getFormattedFunctionName(this.getName()),
                type: "https",
                version: "v1"
            },
            timeoutSeconds: 300,
            memory: "2GB",
            ...this.config?.runtimeOpts
        };

        return this.function = functions.runWith(runtimeOptions).storage.bucket(this.config.bucketName).object().onFinalize(
            async (object: ObjectMetadata, context: EventContext) => {
                try {
                    for (const _onStart of this.onStart) {
                        await _onStart();
                    }

                    return await this.onFinalize(object, context);
                } catch (e) {
                    const _message = `Error handling callback to onFinalize bucket listener method` +
                        "\n" + `File changed ${object.name}` + "\n with attributes: " + __stringify(context) + "\n" + __stringify(e);
                    this.logError(_message);
                    try {
                        await dispatch_onServerError.dispatchModuleAsync(ServerErrorSeverity.Critical, this, _message);
                    } catch (_e) {
                        this.logError("Error while handing bucket listener error", _e);
                    }
                } finally {
                    for (const _onDestroy of this.onDestroy) {
                        await _onDestroy();
                    }
                }
            });
    };
}

export type FirebaseEventContext = EventContext;

export type TopicMessage = { data: string, attributes: StringMap };

function getFormattedFunctionName(name: string) {
    return name.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/\s/g, "_");
}

export abstract class Firebase_PubSubFunction<T, Config extends RuntimeOptsConfigs = any>
    extends FirebaseFunction<Config> {

    private function!: CloudFunction<Message>;
    private readonly topic: string;

    protected constructor(topic: string, name: string, onStart?: () => Promise<void>, onDestroy?: () => Promise<void>) {
        super(name, onStart, onDestroy);
        this.topic = topic;
    }

    abstract onPublish(object: T | undefined, originalMessage: TopicMessage, context: FirebaseEventContext): Promise<any>;

    private _onPublish = async (object: T | undefined, originalMessage: TopicMessage, context: FirebaseEventContext) => {
        try {
            return await this.onPublish(object, originalMessage, context);
        } catch (e) {
            const _message = `Error publishing pub/sub message` + __stringify(object) +
                "\n" + ` to topic ${this.topic}` + "\n with attributes: " + __stringify(originalMessage.attributes) + "\n" + __stringify(e);
            this.logError(_message);
            try {
                await dispatch_onServerError.dispatchModuleAsync(ServerErrorSeverity.Critical, this, _message);
            } catch (_e) {
                this.logError("Error while handing pubsub error", _e);
            }
        }
    };

    getFunction = () => {
        if (this.function)
            return this.function;

        const runtimeOptions = {
            labels: {
                infra: "thunderstorm",
                function_name: getFormattedFunctionName(this.getName()),
                type: "pubsub-topic-publish",
                version: "v1"
            },
            ...this.config?.runtimeOpts
        };
        return this.function = functions.runWith(runtimeOptions).pubsub.topic(this.topic).onPublish(async (message: Message, context: FirebaseEventContext) => {
            // need to validate etc...
            try {
                for (const _onStart of this.onStart) {
                    await _onStart();
                }

                const originalMessage: TopicMessage = message.toJSON();

                let data: T | undefined;
                try {
                    data = JSON.parse(Buffer.from(originalMessage.data, "base64").toString());
                } catch (e) {
                    this.logError(`Error parsing the data attribute from pub/sub message to topic ${this.topic}` +
                        "\n" + __stringify(originalMessage.data) + "\n" + __stringify(e));
                }

                return await this._onPublish(data, originalMessage, context);
            } finally {
                for (const _onDestroy of this.onDestroy) {
                    await _onDestroy();
                }
            }
        });
    };
}

