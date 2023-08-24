import {Action} from "./Action";
import {Exception} from "@intuitionrobotics/ts-common/core/exceptions";


export class Action_ThrowException
	extends Action {
	private readonly message: string;

	protected constructor(message: string, tag?: string) {
		super(Action_ThrowException, tag);
		this.message = message;
	}

	protected async execute() {
		throw new Exception(this.message);
	}
}
