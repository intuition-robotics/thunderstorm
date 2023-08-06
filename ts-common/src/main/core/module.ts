/*
 * ts-common is the basic building blocks of our typescript projects
 *
 * Copyright (C) 2020 Intuition Robotics
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Created by tacb0ss on 08/07/2018.
 */


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
    constructor(name: string) {
		super(name);
		this.name = this.deduceName(name).replace("_Class", "");
	}

	private deduceName(name: string | undefined) {
		if (name)
			return name

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

    public setDefaultConfig(config: Partial<Config>) {
        this.config = config as Config;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public setConfig(config: Config): void {
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
        if(this.configValidator)
            validate(this.config, this.configValidator)
    }
}
