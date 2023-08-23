import {PubSubReadNotification} from "../../../../shared/api";
import {PushPubSubModule} from "../../../modules/PushPubSubModule";
import {ApiResponse, ServerApi} from "@intuitionrobotics/thunderstorm/app-backend/modules/server/server-api";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {ExpressRequest} from "@intuitionrobotics/thunderstorm/app-backend/utils/types";
import {Request_ReadPush} from "../../../../shared/types";

class ServerApi_PushRead
    extends ServerApi<PubSubReadNotification> {

    constructor() {
        super(HttpMethod.POST, "read");
    }

    protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: Request_ReadPush) {
        // const user = await KasperoProxy.validateSession(request);
        return await PushPubSubModule.readNotification(body._id, body.read);
    }
}

module.exports = new ServerApi_PushRead();
