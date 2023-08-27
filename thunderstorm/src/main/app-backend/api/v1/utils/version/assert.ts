

import {
	ApiBinder_AssertAppVersion,
	HeaderKey_PlatformName,
	HeaderKey_PlatformVersion
} from "../../../../../shared/force-upgrade";
import {
	ApiResponse,
	ServerApi
} from "../../../../modules/server/server-api";
import {HttpMethod} from "../../../../../shared/types";
import {ForceUpgrade,} from "../../../../modules/ForceUpgrade";
import {ExpressRequest} from "../../../../utils/types";


class ServerApi_AssertAppVersion
	extends ServerApi<ApiBinder_AssertAppVersion> {

	constructor() {
		super(HttpMethod.GET, "assert");
		this.addHeaderToLog(HeaderKey_PlatformVersion, HeaderKey_PlatformName);
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void) {
		return ForceUpgrade.compareVersion(request);
	}
}

module.exports = new ServerApi_AssertAppVersion();
