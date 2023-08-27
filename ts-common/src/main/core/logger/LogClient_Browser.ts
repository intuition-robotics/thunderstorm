
import {
	LogLevel,
	LogParam
} from "./types";
import {LogClient} from "./LogClient";

class LogClient_Browser_class
	extends LogClient {

	getColor(level: LogLevel, bold: boolean): string {
		let color;
		switch (level) {
			case LogLevel.Verbose:
				color = '#000000';
				break;

			case LogLevel.Debug:
				color = '#0905AD';
				break;

			case LogLevel.Info:
				color = '#189702';
				break;

			case LogLevel.Warning:
				color = '#926E00';
				break;

			case LogLevel.Error:
				color = '#B40000';
				break;
		}

		return color || '#000000';
	}

	protected logMessage(level: LogLevel, bold: boolean, prefix: string, toLog: LogParam[]): void {
		const color = this.getColor(level, bold);
		for (const param of toLog) {
			if (typeof param === "string") {
				console.log(`%c${prefix}${param}`, `color: ${color}`);
				continue
			}

			console.log(param);
		}
	}
}

export const LogClient_Browser = new LogClient_Browser_class();
