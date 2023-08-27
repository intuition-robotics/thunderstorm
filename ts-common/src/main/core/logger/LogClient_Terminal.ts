
import {
	LogLevel,
	LogParam
} from "./types";
import {LogClient} from "./LogClient";
import {
	_logger_convertLogParamsToStrings,
	_logger_indentNewLineBy
} from "./utils";

export const NoColor = '\x1b[0m';

class LogClient_Terminal_class
	extends LogClient {

	getColor(level: LogLevel, bold = false): string {
		let color;
		switch (level) {
			case LogLevel.Verbose:
				color = '\x1b[90m';
				break;

			case LogLevel.Debug:
				color = '\x1b[34m';
				break;

			case LogLevel.Info:
				color = '\x1b[32m';
				break;

			case LogLevel.Warning:
				color = '\x1b[33m';
				break;

			case LogLevel.Error:
				color = '\x1b[31m';
				break;
		}
		return color + (bold ? '\x1b[1m' : '');
	}

	protected logMessage(level: LogLevel, bold: boolean, prefix: string, toLog: LogParam[]): void {
		const color = this.getColor(level, bold);
		const paramsAsStrings = _logger_convertLogParamsToStrings(toLog);

		console.log(_logger_indentNewLineBy(color + prefix, paramsAsStrings.join(" ")) + NoColor)
	}
}


export const LogClient_Terminal = new LogClient_Terminal_class();
