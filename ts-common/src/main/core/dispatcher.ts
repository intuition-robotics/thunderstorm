
import {
	FunctionKeys,
	ReturnPromiseType
} from "../utils/types";

export class Dispatcher<T extends object, K extends FunctionKeys<T>> {

	static modulesResolver: () => any[];

	protected readonly method: K;
	protected readonly filter: (listener: any) => boolean;

	constructor(method: K) {
		this.method = method;
		this.filter = (listener: any) => !!listener[this.method];
	}

	public dispatchModule(p: Parameters<T[K]>): ReturnPromiseType<T[K]>[] {
		const listeners = Dispatcher.modulesResolver();
		const params: any = p;
		return listeners.filter(this.filter).map((listener: T) => listener[this.method](...params));
	}

	public async dispatchModuleAsync(p: Parameters<T[K]>): Promise<ReturnPromiseType<T[K]>[]> {
		const listeners = Dispatcher.modulesResolver();
		return Promise.all(listeners.filter(this.filter).map(async (listener: T) => {
			const params: any = p;
			return listener[this.method](...params);
		}));
	}
}


