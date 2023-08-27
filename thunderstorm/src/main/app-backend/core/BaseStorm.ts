
import {ModuleManager} from "@intuitionrobotics/ts-common/core/module-manager";

export abstract class BaseStorm
    extends ModuleManager {
    private envKey: string = "dev";
    setEnvironment(envKey: string) {
        this.envKey = envKey;
        return this;
    }

    getEnvironment(){
        return this.envKey;
    }
}
