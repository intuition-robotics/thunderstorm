
export enum LogLevel {
	Verbose = 'Verbose',
	Debug   = 'Debug',
	Info    = 'Info',
	Warning = 'Warning',
	Error   = 'Error',
}

export const LogLevelOrdinal = [
	LogLevel.Verbose,
	LogLevel.Debug,
	LogLevel.Info,
	LogLevel.Warning,
	LogLevel.Error,
];

export type LogPrefixComposer = (tag: string, level: LogLevel) => string;
export type LogParam = string | number | object | any[] | Error | undefined | null
