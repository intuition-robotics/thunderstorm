
import {
	HeaderKey,
	ServerApi_Middleware
} from "./server/HttpServer";

import {ApiException} from "../exceptions";
import {
	HeaderKey_PlatformName,
	HeaderKey_PlatformVersion,
	UpgradeRequired
} from "../../shared/force-upgrade";
import {PlatformName} from "../../shared/consts";
import {ExpressRequest} from "../utils/types";
import { Module } from "@intuitionrobotics/ts-common/core/module";
import { BadImplementationException } from "@intuitionrobotics/ts-common/core/exceptions";
import { __stringify } from "@intuitionrobotics/ts-common/utils/tools";

type VersionConfig = {
	[K in PlatformName]: {
		regexp: string,
		minimumValidVersion?: string
	}
};

const Header_PlatformVersion = new HeaderKey(HeaderKey_PlatformVersion);
const Header_PlatformName = new HeaderKey(HeaderKey_PlatformName);

// const DefaultRegexps: { [k in PlatformName]: string } = {
// 	chrome: "Chrome/([0-9\.]+)"
// };

class ForceUpgrade_Class
	extends Module<VersionConfig> {

	constructor() {
		super("ForceUpgrade");
	}

	static readonly Middleware: ServerApi_Middleware = async (request: ExpressRequest) => ForceUpgrade.assertVersion(request);

	compareVersion(request: ExpressRequest): UpgradeRequired {
		const platformVersion = Header_PlatformVersion.get(request);
		const platformName: PlatformName = Header_PlatformName.get(request);

		if (!platformName)
			throw new ApiException(500, `Platform name was not specified`);

		if (!platformVersion)
			throw new ApiException(500, `Platform version was not specified`);

		const platformNameConfig = this.config[platformName];
		if (!platformNameConfig || !platformNameConfig.regexp)
			return {}; // no info about this platformName

		const regex = new RegExp(platformNameConfig.regexp)
		const match: RegExpMatchArray | null = platformVersion.match(regex);
		if (!match)
			throw new BadImplementationException(`Error extracting version.. \nVersion: '${platformVersion}'\n config: '${__stringify(this.config)}'`);

		const minimumValidVersion = platformNameConfig.minimumValidVersion;
		if (!minimumValidVersion)
			return {
				upgradeRequired: false
			};

		const matchGroups = match.groups;
		if (!matchGroups)
			throw new BadImplementationException(
				`If minimumValidVersion is provided ${platformNameConfig.minimumValidVersion}, then groups in regex have to be defined ${__stringify(
					match)}. i.e. "(?<first>[0-9]+).(?<second>[0-9]+).(?<third>[0-9]+)"`);

		const minimumVersionMatch: RegExpMatchArray | null = minimumValidVersion.match(regex);
		if (!minimumVersionMatch)
			throw new BadImplementationException(
				`Error extracting minimum valid version. \nVersion: '${minimumValidVersion}'\n config: '${__stringify(this.config)}'`);

		const versionsGroups = minimumVersionMatch.groups;
		if (!versionsGroups)
			throw new BadImplementationException(
				`If minimumValidVersion is provided ${platformNameConfig.minimumValidVersion}, then groups in regex have to be defined ${__stringify(
					minimumVersionMatch)}. i.e. "(?<first>[0-9]+).(?<second>[0-9]+).(?<third>[0-9]+)"`);

		const versions: string[] = Object.values(matchGroups);
		const minimumVersions: string[] = Object.values(versionsGroups);

		for (let i = 0; i < versions.length; i++) {
			const v = versions[i];
			const minV = minimumVersions[i];

			if (+v < +minV)
				return {upgradeRequired: true}
		}

		return {upgradeRequired: false}
	}

	async assertVersion(request: ExpressRequest): Promise<void> {
		const upgradeRequired = this.compareVersion(request);
		if (upgradeRequired.upgradeRequired)
			throw new ApiException<UpgradeRequired>(426, "require upgrade..").setErrorBody({type: "upgrade-required", body: upgradeRequired})
	}
}

export const ForceUpgrade = new ForceUpgrade_Class();
