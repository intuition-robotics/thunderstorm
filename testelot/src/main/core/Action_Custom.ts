import {Action} from "./Action";

export class Action_Custom<ParamValue extends any = any, ReturnValue extends any = any>
	extends Action<ParamValue, ReturnValue> {
	private readonly action: (action: Action_Custom, param: ParamValue) => Promise<ReturnValue>;

	protected constructor(action: (action: Action_Custom, param: ParamValue) => Promise<ReturnValue>) {
		super(Action_Custom);
		this.action = action;
	}

	protected async execute(param: ParamValue): Promise<ReturnValue> {
		return await this.action(this, param);
	}
}
