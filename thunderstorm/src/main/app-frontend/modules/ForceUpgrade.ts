
import {Module} from "@intuitionrobotics/ts-common/core/module";
import {XhrHttpModule} from "./http/XhrHttpModule";
import {
    ApiBinder_AssertAppVersion,
    HeaderKey_PlatformName,
    HeaderKey_PlatformVersion,
    UpgradeRequired
} from "../../shared/force-upgrade";
import {HttpMethod} from "../../shared/types";
import {browserType} from "../utils/tools";
import {Dispatcher} from "@intuitionrobotics/ts-common/core/dispatcher";

export const RequestKey_AssertAppVersion = "assert-app-version";
type Config = {
    assertVersionUrl: string
}

export interface OnUpgradeRequired {
    __onUpgradeRequired(response: UpgradeRequired): void;
}

const dispatch_onUpgradeRequired = new Dispatcher<OnUpgradeRequired, "__onUpgradeRequired">("__onUpgradeRequired");

class ForceUpgrade_Class
    extends Module<Config> {

    constructor() {
        super("ForceUpgrade");
    }

    protected init(): void {
        XhrHttpModule.addDefaultHeader(HeaderKey_PlatformVersion, `${process.env.appVersion}`);
        XhrHttpModule.addDefaultHeader(HeaderKey_PlatformName, `${browserType()}`);
    }

    compareVersion = () => {
        XhrHttpModule
            .createRequest<ApiBinder_AssertAppVersion>(HttpMethod.GET, RequestKey_AssertAppVersion)
            .setRelativeUrl(this.config.assertVersionUrl)
            .execute((response: UpgradeRequired) => {
                dispatch_onUpgradeRequired.dispatchModule([response]);
            });
    };
}

export const ForceUpgrade = new ForceUpgrade_Class();
