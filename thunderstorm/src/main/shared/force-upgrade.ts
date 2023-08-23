import {ApiWithQuery} from "./types";

export const HeaderKey_PlatformVersion = "x-platform-version";
export const HeaderKey_PlatformName = "x-platform-name";

export type UpgradeRequired = {
	upgradeRequired?: boolean
};

export type ApiBinder_AssertAppVersion = ApiWithQuery<string, UpgradeRequired>;
