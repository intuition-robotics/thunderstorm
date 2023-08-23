import {ErrorResponse} from "./types";
import {BaseHttpRequest} from "./BaseHttpRequest";

export class HttpException
	extends Error {
	constructor(responseCode: number, url: string, e?: Error) {
		super(`${responseCode} - ${url}` + "\n" + e?.message + "\n" + e?.stack);
	}
}

export type TS_Progress = {
	readonly lengthComputable: boolean;
	readonly loaded: number;
	readonly target: any;
	readonly total: number;
}

export interface OnRequestListener {
	__onRequestCompleted: (key: string, success: boolean, requestData?: string) => void;
}

export type RequestErrorHandler<E extends void | object> = (request: BaseHttpRequest<any>, resError?: ErrorResponse<E>) => void;
export type RequestSuccessHandler = (request: BaseHttpRequest<any>) => void;
export type ResponseHandler = (request: BaseHttpRequest<any>) => boolean;
