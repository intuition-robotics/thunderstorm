import {ApiResponse, ServerApi_Get} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";

class ServerApi_Ping extends ServerApi_Get<any> {
    constructor() {
        super("ping");
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void) {
        return "pong"
    }
};
module.exports = new ServerApi_Ping
