import {
	ApiResponse,
	ExpressRequest,
	ServerApi_Get,
} from "@intuitionrobotics/thunderstorm/backend";

import {ExampleTestPush} from "@app/app-shared";
import {PushPubSubModule} from "@intuitionrobotics/push-pub-sub/backend";

class ServerApi_PushTest
	extends ServerApi_Get<ExampleTestPush> {

	constructor() {
		super("push-test");
	}

	protected async process(request: ExpressRequest, response: ApiResponse, queryParams: {}, body: void) {
		await PushPubSubModule.pushToKey('key', {a: 'prop'}, {some: 'more', data: 'here'}, true);
		// await PushPubSubModule.pushToUser('9226fa2e4c128b84fd46526ca6ee926c', 'key', {a: 'prop'}, {some: 'more', data: 'here'}, true);
		return "push succeeded!";
	}
}

module.exports = new ServerApi_PushTest();
