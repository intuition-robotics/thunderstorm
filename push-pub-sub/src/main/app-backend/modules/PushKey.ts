import {PushPubSubModule} from "./PushPubSubModule";
import {SubscribeProps} from "../../shared/types";
import {ObjectTS} from "@intuitionrobotics/ts-common/utils/types";

export class PushKey<K extends string, P extends SubscribeProps, D extends ObjectTS> {

    private readonly key: K;
    private readonly persist: boolean;

    constructor(key: K, persist = false) {
        this.key = key;
        this.persist = persist;
    }

    async push(data: D, props?: P) {
        return PushPubSubModule.pushToKey(this.key, props, data, this.persist);
    };
}
