import {FirebaseFunctionModule,} from "@intuitionrobotics/firebase/backend-functions";
import {PushPubSubModule} from "@intuitionrobotics/push-pub-sub/backend";

export class ValueChangedListener_Class
	extends FirebaseFunctionModule {

	constructor() {
		super(`test/{param}/changes/value`, "ValueChangedListener");
		this.getFunction = this.getFunction.bind(this);
	}

	processChanges = async (previousValue: any, newValue: any, params: { [p: string]: any }): Promise<any> => {
		this.logInfo(`Doing nothing...`);
		await PushPubSubModule.pushToKey('test', {id: 'test1'}, {a: 'b', b: 1});
	};
}

export const ValueChangedListener = new ValueChangedListener_Class();

