// tslint:disable:no-import-side-effect
import "firebase/auth";
import {getAuth, signInWithCustomToken, signOut} from "firebase/auth";
import {FirebaseApp, initializeApp} from "firebase/app";
import {Logger} from "@intuitionrobotics/ts-common/core/logger/Logger";

import {ThisShouldNotHappenException} from "@intuitionrobotics/ts-common/core/exceptions";
import {MessagingWrapper} from "../messaging/MessagingWrapper";
import {AnalyticsWrapper} from "../analytics/AnalyticsWrapper";
import {DatabaseWrapper} from "../database/DatabaseWrapper";
import {getMessaging} from "firebase/messaging";
import {getAnalytics} from "firebase/analytics";
import {getDatabase} from "firebase/database";
import {getFirestore} from "firebase/firestore";
import {FirebaseConfig} from "../../shared/types";

export class FirebaseSession
    extends Logger {
    app!: FirebaseApp;

    protected config: FirebaseConfig;
    protected sessionName: string;
    protected messaging?: MessagingWrapper;
    protected analytics?: AnalyticsWrapper;
    protected database?: DatabaseWrapper;

    constructor(sessionName: string, config: FirebaseConfig) {
        super(`firebase: ${sessionName}`);
        this.sessionName = sessionName;
        this.config = config;
    }

    public connect(): void {
        this.app = initializeApp(this.config, this.sessionName);
    }

    getMessaging() {
        if (this.messaging)
            return this.messaging;

        return this.messaging = new MessagingWrapper(getMessaging(this.app));
    }

    getAnalytics() {
        if (this.analytics)
            return this.analytics;

        return this.analytics = new AnalyticsWrapper(getAnalytics(this.app));
    }

    getDatabase() {
        if (this.database)
            return this.database;

        return this.database = new DatabaseWrapper(getDatabase(this.app));
    }

    async signInWithToken(token: string) {
        return signInWithCustomToken(getAuth(this.app), token)
    };

    getFirestore() {
        return getFirestore(this.app)
    }

    async signOut() {
        return signOut(getAuth(this.app))
    }

    getProjectId(): string {
        if (!this.config)
            throw new ThisShouldNotHappenException("Missing config. Probably init not resolved yet!");

        if (!this.config.projectId)
            throw new ThisShouldNotHappenException("Could not deduce project id from session config.. if you need the functionality.. add it to the config!!");

        return this.config.projectId;
    }
}

