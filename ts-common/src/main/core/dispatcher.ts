import {FunctionKeys, ParamResolver, ReturnTypeResolver} from "../utils/types";

export class Dispatcher<T,
    K extends FunctionKeys<T>,
    P extends ParamResolver<T, K> = ParamResolver<T, K>,
    R extends ReturnTypeResolver<T, K> = ReturnTypeResolver<T, K>> {

    static modulesResolver: () => any[];

    protected readonly method: K;
    protected readonly filter: (listener: any) => boolean;

    constructor(method: K) {
        this.method = method;
        this.filter = (listener: any) => !!listener[this.method];
    }

    public dispatchModule(...p: P): R[] {
        const listeners = Dispatcher.modulesResolver();
        // @ts-ignore
        return listeners.filter(this.filter).map((listener: T) => listener[this.method](...p));
    }

    public async dispatchModuleAsync(...p: P): Promise<R[]> {
        const filtered = Dispatcher.modulesResolver().filter(this.filter);
        // @ts-ignore
        return Promise.all(filtered.map(async (listener: T) => listener[this.method](...p)));
    }
}



