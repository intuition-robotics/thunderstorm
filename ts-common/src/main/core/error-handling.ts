
import {Module} from "./module";
import {Dispatcher} from "./dispatcher";

export enum ServerErrorSeverity {
	Debug    = "Debug",
	Info     = "Info",
	Warning  = "Warning",
	Error    = "Error",
	Critical = "Critical",
}

export const ServerErrorSeverity_Ordinal = [
	ServerErrorSeverity.Debug,
	ServerErrorSeverity.Info,
	ServerErrorSeverity.Warning,
	ServerErrorSeverity.Error,
	ServerErrorSeverity.Critical
];

export interface OnApplicationError {
	__processApplicationError(errorLevel: ServerErrorSeverity, module: Module, message: string): Promise<void>;
}

export const dispatch_onServerError = new Dispatcher<OnApplicationError, "__processApplicationError">("__processApplicationError");
