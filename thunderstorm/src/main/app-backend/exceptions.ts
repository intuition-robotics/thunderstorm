import {CustomException} from "@intuitionrobotics/ts-common";
import {
	ErrorBody,
	ErrorResponse
} from "../index";

export class ApiException<E extends object | void = void>
	extends CustomException {

	public readonly responseBody: ErrorResponse<E> = {};
	public readonly responseCode: number;

	public readonly setErrorBody = (errorBody: ErrorBody<E>) => {
		this.responseBody.error = errorBody;
		return this;
	};

	constructor(responseCode: number, debugMessage?: string, cause?: any) {
		super(ApiException, `${responseCode}-${JSON.stringify(debugMessage)}`, cause);

		this.responseCode = responseCode;
		this.responseBody.debugMessage = JSON.stringify(debugMessage);
	}

}

