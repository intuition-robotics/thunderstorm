
import {
	ApiResponse,
	ExpressRequest,
	ServerApi_Post
} from "@intuitionrobotics/thunderstorm/backend";
import {
	Api_GetUploadUrl,
	BaseUploaderFile
} from "../../../../shared/types";
import {QueryParams} from "@intuitionrobotics/thunderstorm";
import {UploaderModule} from "../../../modules/UploaderModule";


class ServerApi_GetUploadUrl
	extends ServerApi_Post<Api_GetUploadUrl> {
	constructor() {
		super('get-url')
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: QueryParams, body: BaseUploaderFile[]) {
		return UploaderModule.getUrl(body);
	}
}

module.exports = new ServerApi_GetUploadUrl()
