import {Action} from "./Action";
import {LogLevel} from "@intuitionrobotics/ts-common/core/logger/types";


export class Action_Log
	extends Action {
	private readonly logMessage: string;
	private readonly level: LogLevel;

	protected constructor(logMessage: string, level: LogLevel) {
		super(Action_Log);
		this.setLabel();
		this.logMessage = logMessage;
		this.level = level;
	}

	protected async execute() {
		this.log(this.level, false, [this.logMessage]);
	}
}
