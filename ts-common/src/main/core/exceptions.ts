
// noinspection TypeScriptPreferShortImport
import {Constructor} from "../utils/types";

export function isErrorOfType<T extends Error>(e: Error, _exceptionType: Constructor<T>): T | undefined {
	const _e = e as any;
	if (_e.isInstanceOf && _e.isInstanceOf(_exceptionType))
		return e as T;
}

export abstract class CustomException
	extends Error {

	public exceptionType: string;

	public isInstanceOf: (_exceptionType: Function) => boolean;
	public cause?: Error;

	protected constructor(exceptionType: Function, message: string, cause?: Error) {
		super(message);
		this.message = message;
		this.stack = (new Error(message)).stack;
		this.cause = cause;
		this.exceptionType = exceptionType.name;
		this.isInstanceOf = (_exceptionType: Function): boolean => {
			return this.exceptionType === _exceptionType.name;
		}
	}
}

export class Exception
	extends CustomException {

	constructor(message: string, cause?: Error) {
		super(Exception, message, cause);
	}
}

export class BadImplementationException
	extends CustomException {

	constructor(message: string, cause?: Error) {
		super(BadImplementationException, message, cause);
	}
}

export class ImplementationMissingException
	extends CustomException {

	constructor(message: string, cause?: Error) {
		super(ImplementationMissingException, message, cause);
	}
}

export class MUSTNeverHappenException
	extends CustomException {

	constructor(message: string, cause?: Error) {
		super(MUSTNeverHappenException, message, cause);
	}
}

export class NotImplementedYetException
	extends CustomException {

	constructor(message: string, cause?: Error) {
		super(NotImplementedYetException, message, cause);
	}
}

export class ThisShouldNotHappenException
	extends CustomException {

	constructor(message: string, cause?: Error) {
		super(ThisShouldNotHappenException, message, cause);
	}
}

export class DontCallthisException
	extends CustomException {

	constructor(message: string, cause?: Error) {
		super(DontCallthisException, message, cause);
	}
}

export class WhoCallthisException
	extends CustomException {

	constructor(message: string, cause?: Error) {
		super(WhoCallthisException, message, cause);
	}
}

export class AssertionException
	extends CustomException {

	constructor(message: string, cause?: Error) {
		super(AssertionException, message, cause);
	}
}
