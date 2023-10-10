import {Dispatcher} from "@intuitionrobotics/ts-common/core/dispatcher";
import {
	FunctionKeys,
	ReturnPromiseType
} from "@intuitionrobotics/ts-common/utils/types";
import {removeItemFromArray} from "@intuitionrobotics/ts-common/utils/array-tools";

const listeners: any[] = [];

export const addUIListener = (listener: any): void  => {
	console.log(`Register UI listener: ${listener}`);
	listeners.push(listener);
}

export const removeUIListener = (listener: any): void  => {
	console.log(`Unregister UI listener: ${listener}`);
	removeItemFromArray(listeners, listener);
}

export class ThunderDispatcher<T extends object, K extends FunctionKeys<T>>
	extends Dispatcher<T, K> {

	constructor(method: K) {
		super(method);
	}

	public dispatchUI(p: Parameters<T[K]>): ReturnPromiseType<T[K]>[] {
		// @ts-ignore
		return listeners.filter(this.filter).map((listener: T) => listener[this.method](...p));
	}

	public async dispatchUIAsync(p: Parameters<T[K]>): Promise<ReturnPromiseType<T[K]>[]> {
		return Promise.all(listeners.filter(this.filter).map(async (listener: T) => {
			const params: any = p;
			return listener[this.method](...params);
		}));
	}
}

