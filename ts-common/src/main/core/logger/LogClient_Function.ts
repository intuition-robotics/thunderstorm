
import {
	LogLevel,
	LogParam
} from "./types";
import {LogClient} from "./LogClient";
import {_logger_logException} from "./utils";

class LogClient_Function_class
	extends LogClient {
	constructor() {
		super();
		this.setComposer((tag, level) => `${level} ${tag}: `)
	}

	protected logMessage(level: LogLevel, bold: boolean, prefix: string, toLog: LogParam[]): void {
		for (const logParam of toLog) {
			if (logParam)
				// @ts-ignore
				if (logParam.stack) {
					console.log(`${prefix}${_logger_logException(logParam as Error)}`);
					continue;
				}

			switch (typeof logParam) {
				case "undefined":
				case "function":
				case "symbol":
				case "bigint":
					console.log(`${prefix}${typeof logParam}`);
					continue;

				case "boolean":
				case "number":
				case "string":
					console.log(`${prefix}${logParam}`);
					continue;

				case "object":
					console.log(`${prefix}${JSON.stringify(logParam)}`);
					continue;
			}
		}
	}
}

export const LogClient_Function = new LogClient_Function_class();
