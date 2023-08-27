import {Action_Container} from "./Action_Container";

export class Scenario
	extends Action_Container {

	protected constructor() {
		super(Scenario);
	}

	public run = async () => {
		// @ts-ignore
		await this._execute();
	};
}
