import {ModuleManager} from "./module-manager";
import {BadImplementationException} from "./exceptions";
import {merge} from "../utils/merge-tools";
import {Logger} from "./logger/Logger";
import {validate, ValidatorTypeResolver} from "../validator/validator";
import {_clearTimeout, _setTimeout, currentTimeMillies, TimerHandler} from "../utils/date-time-tools";

export abstract class Module<Config = any>
    extends Logger {
    private name: string;
    protected manager?: ModuleManager;
    public readonly initiated = false;
    protected config: Config = {} as Config;
    protected configValidator?: ValidatorTypeResolver<Config>;
    protected timeoutMap: { [k: string]: number } = {};

    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(config: Config, tag: string)
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(name: string, tag?: string)
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(p1: any, p2?: string) {
        // If we have a tag we use it, if not we try to use the name of the class or else we use the name of the class (bad)
        super( p2 ? p2 : typeof p1 === "string" ? p1 : undefined);
        this.name = this.deduceName(p1, p2).replace("_Class", "");
    }

    private deduceName(p1: any, p2?: string): string {
        if (typeof p1 === "object") {
            if (p2 === undefined)
                throw new BadImplementationException(`Modules initialized with a config object must have a tag`);

            this.config = p1;
            return p2;
        }

        if (p1)
            return p1

        const tempName = this.constructor["name"];
        if (!tempName.endsWith("_Class"))
            throw new BadImplementationException(`Module class MUST end with '_Class' e.g. MyModule_Class, check class named: ${tempName}`);
        return tempName
    }

    // // possibly to add
    // public async debounceSync(handler: TimerHandler, key: string, ms = 0) {
    // 	_clearTimeout(this.timeoutMap[key]);
    //
    // 	await new Promise((resolve, reject) => {
    // 		this.timeoutMap[key] = setTimeout(async (..._args) => {
    // 			try {
    // 				await handler(..._args);
    // 				resolve();
    // 			} catch (e) {
    // 				reject(e);
    // 			}
    // 		}, ms) as unknown as number;
    // 	});
    // }
    debounce(handler: TimerHandler, key: string, ms = 0) {
        const k = "debounce" + key;
        _clearTimeout(this.timeoutMap[k]);
        this.timeoutMap[k] = _setTimeout(handler, ms);
    }

    throttle(handler: TimerHandler, key: string, ms = 0) {
        const k = "throttle" + key;
        if (this.timeoutMap[k])
            return;
        this.timeoutMap[k] = _setTimeout(() => {
            handler();
            delete this.timeoutMap[k];
        }, ms);
    }

    throttleV2(handler: TimerHandler, key: string, ms: number, force = false) {
        const k = "throttle_v2" + key;
        const now = currentTimeMillies();
        const timeoutMapElement = this.timeoutMap[k];
        if (timeoutMapElement && now - timeoutMapElement <= ms && !force)
            return;

        handler();
        this.timeoutMap[k] = currentTimeMillies();
    }

    public setConfigValidator(validator: ValidatorTypeResolver<Config>) {
        this.configValidator = validator;
    }

    /**
     * @deprecated The method has been deprecated in favour of {@link setConfig}
     */
    public setDefaultConfig(config: Partial<Config>) {
        this.setConfig(config);
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public setConfig(config: Partial<Config>): void {
        this.config = this.config ? merge(this.config, config || {}) : config;
    }

    public setManager(manager: ModuleManager): void {
        this.manager = manager;
    }

    protected runAsync = (label: string, toCall: () => Promise<any>) => {
        setTimeout(() => {
            this.logDebug(`Running async: ${label}`);
            new Promise(toCall)
                .then(() => {
                    this.logDebug(`Async call completed: ${label}`);
                })
                .catch(reason => this.logError(`Async call error: ${label}`, reason));
        }, 0);
    };

    protected init(): void {
        // ignorance is bliss
    }

    public validate(): void {
        if (this.configValidator)
            validate(this.config, this.configValidator)
    }
}
