import {Action} from "./Action";
import {timeout} from "@intuitionrobotics/ts-common/utils/date-time-tools";


export class Action_Sleep
	extends Action {
	private readonly sleepMs: number;

	protected constructor(sleepMs: number) {
		super(Action_Sleep);
		this.setLabel(`Sleeping for ${sleepMs} ms`);
		this.sleepMs = sleepMs;
	}

	protected async execute() {
		return timeout(this.sleepMs);
	}
}
