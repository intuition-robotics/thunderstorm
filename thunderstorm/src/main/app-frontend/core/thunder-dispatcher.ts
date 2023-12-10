import {Dispatcher} from "@intuitionrobotics/ts-common/core/dispatcher";
import {FunctionKeys, ParamResolver, ReturnTypeResolver} from "@intuitionrobotics/ts-common/utils/types";

export class ThunderDispatcher<T,
    K extends FunctionKeys<T>,
    P extends ParamResolver<T, K> = ParamResolver<T, K>,
    R extends ReturnTypeResolver<T, K> = ReturnTypeResolver<T, K>>
    extends Dispatcher<T, K, P, R> {

    static readonly listenersResolver: () => any[];

    constructor(method: K) {
        super(method);
    }

    public dispatchUI(...p: P): R[] {
        const listeners = ThunderDispatcher.listenersResolver();
        // @ts-ignore
        return listeners.filter(this.filter).map((listener: T) => listener[this.method](...p));
    }

    public async dispatchUIAsync(...p: P): Promise<R[]> {
        const filtered = ThunderDispatcher.listenersResolver().filter(this.filter);
        // @ts-ignore
        return Promise.all(filtered.map(async (listener: T) => listener[this.method](...p)));
    }
}

