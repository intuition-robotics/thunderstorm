import {PushPubSubModule} from "../../../modules/PushPubSubModule";
import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {PubSubRegisterClient} from "../../../../shared/api";
import {Request_PushRegister} from "../../../../shared/types";


class ServerApi_PushRegister
    extends ServerApi<PubSubRegisterClient> {

    constructor() {
        super(HttpMethod.POST, "register");
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_PushRegister) {
        return await PushPubSubModule.register(body, request);
    }
}

module.exports = new ServerApi_PushRegister();



