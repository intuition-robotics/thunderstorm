
import {
	LogLevel,
	LogParam,
	LogPrefixComposer
} from "./types";

export type LogFilter = (level: LogLevel, tag: string) => boolean;

export abstract class LogClient {

	private prefixComposer: LogPrefixComposer = DefaultLogPrefixComposer;
	private filter: LogFilter = () => true;

	protected abstract logMessage(level: LogLevel, bold: boolean, prefix: string, ...toLog: LogParam[]): void;

	public setComposer(logComposer: LogPrefixComposer) {
		this.prefixComposer = logComposer;
	}

	setFilter(filter: LogFilter) {
		this.filter = filter;
		return this;
	}

	public log(tag: string, level: LogLevel, bold: boolean, toLog: LogParam[]): void {
		if (!this.filter(level, tag))
			return;

		this.logMessage(level, bold, this.prefixComposer(tag, level), toLog);
	}
}

export const _logger_timezoneOffset: number = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
export const _logger_finalDate: Date = new Date();

export function _logger_getPrefix(level: LogLevel) {
	switch (level) {
		case LogLevel.Verbose:
			return '-V-';

		case LogLevel.Debug:
			return '-D-';

		case LogLevel.Info:
			return '-I-';

		case LogLevel.Warning:
			return '-W-';

		case LogLevel.Error:
			return '-E-';

		default:
			return '---';
	}
}

export const DefaultLogPrefixComposer: LogPrefixComposer = (tag: string, level: LogLevel): string => {
	_logger_finalDate.setTime(Date.now() - _logger_timezoneOffset);
	const date = _logger_finalDate.toISOString().replace(/T/, '_').replace(/Z/, '').substr(0, 23);
	return `  ${date} ${_logger_getPrefix(level)} ${tag}:  `;
};


