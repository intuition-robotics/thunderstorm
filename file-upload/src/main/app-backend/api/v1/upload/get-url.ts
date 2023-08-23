import {ApiResponse, ServerApi_Post} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {QueryParams} from "@intuitionrobotics/thunderstorm/shared/types";
import {Api_GetUploadUrl, BaseUploaderFile} from "../../../../shared/types";
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
