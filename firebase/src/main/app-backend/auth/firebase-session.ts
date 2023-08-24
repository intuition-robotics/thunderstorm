import {Logger} from "@intuitionrobotics/ts-common/core/logger/Logger";
import {FirestoreWrapper} from "../firestore/FirestoreWrapper";
import {DatabaseWrapper} from "../database/DatabaseWrapper";
import {StorageWrapper} from "../storage/StorageWrapper";
import {PushMessagesWrapper} from "../push/PushMessagesWrapper";
import {FirebaseConfig} from "../../shared/types";


export type Firebase_UserCredential = {
    config: FirebaseConfig
    credentials: {
        user: string;
        password: string;
    }
};

export abstract class FirebaseSession<Config, AppType>
    extends Logger {
    app!: AppType;
    protected database?: DatabaseWrapper;
    protected storage?: StorageWrapper;
    protected firestore?: FirestoreWrapper;
    protected messaging?: PushMessagesWrapper;

    protected config: Config;
    protected sessionName: string;
    private readonly admin: boolean;

    protected constructor(config: Config, sessionName: string, _admin = true) {
        super(`firebase: ${sessionName}`);
        this.sessionName = sessionName;
        this.config = config;
        this.admin = _admin;
    }

    abstract getProjectId(): string;

    public isAdmin() {
        return this.admin;
    }

    public abstract connect(): void ;

    public getDatabase(): DatabaseWrapper {
        if (this.database)
            return this.database;

        return this.database = new DatabaseWrapper(this);
    }

    public getStorage(): StorageWrapper {
        if (this.storage)
            return this.storage;

        return this.storage = new StorageWrapper(this);
    }

    public getFirestore(): FirestoreWrapper {
        if (this.firestore)
            return this.firestore;

        return this.firestore = new FirestoreWrapper(this);
    }

    public getMessaging(): PushMessagesWrapper {
        if (this.messaging)
            return this.messaging;

        return this.messaging = new PushMessagesWrapper(this);
    }
}
