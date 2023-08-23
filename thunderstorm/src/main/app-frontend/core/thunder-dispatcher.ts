import {Dispatcher} from "@intuitionrobotics/ts-common/core/dispatcher";
import {
	FunctionKeys,
	ReturnPromiseType
} from "@intuitionrobotics/ts-common/utils/types";

export class ThunderDispatcher<T extends object, K extends FunctionKeys<T>>
	extends Dispatcher<T, K> {

	static readonly listenersResolver: () => any[];

	constructor(method: K) {
		super(method);
	}

	public dispatchUI(p: Parameters<T[K]>): ReturnPromiseType<T[K]>[] {
		const listeners = ThunderDispatcher.listenersResolver();
		// @ts-ignore
		return listeners.filter(this.filter).map((listener: T) => listener[this.method](...p));
	}

	public async dispatchUIAsync(p: Parameters<T[K]>): Promise<ReturnPromiseType<T[K]>[]> {
		const listeners = ThunderDispatcher.listenersResolver();
		return Promise.all(listeners.filter(this.filter).map(async (listener: T) => {
			const params: any = p;
			return listener[this.method](...params);
		}));
	}
}

