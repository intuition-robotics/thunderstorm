import {Module} from "@intuitionrobotics/ts-common/core/module";
import {ImplementationMissingException} from "@intuitionrobotics/ts-common/core/exceptions";
import {FirebaseModule} from "../FirebaseModule";
import {AnalyticsWrapper} from "./AnalyticsWrapper";

class FirebaseAnalyticsModule_Class
    extends Module {

    constructor() {
        super("FirebaseAnalyticsModule");
    }

    private analytics?: AnalyticsWrapper;

    protected init(): void {
        this.runAsync('Init Analytics', this._init);
    }

    private _init = async () => {
        const session = await FirebaseModule.createSession();

        this.analytics = session.getAnalytics();
        this.analytics.setAnalyticsCollectionEnabled(true);
    };

    logEvent(eventName: string, eventParams?: { [key: string]: any }) {
        if (!this.analytics)
            throw new ImplementationMissingException('Missing analytics wrapper');

        return this.analytics.logEvent(eventName, eventParams);
    }

    setCurrentScreen(screenName: string) {
        if (!this.analytics)
            throw new ImplementationMissingException('Missing analytics wrapper');

        return this.analytics.setCurrentScreen(screenName);
    }
}

export const FirebaseAnalyticsModule = new FirebaseAnalyticsModule_Class();
