import * as React from "react";
import {StorageModule} from "../modules/StorageModule";
import {ResourcesModule} from "../modules/ResourcesModule";
import {BrowserHistoryModule} from "../modules/HistoryModule";
import {Thunder} from "./Thunder";
import { Logger } from "@intuitionrobotics/ts-common/core/logger/Logger";
import {currentTimeMillies, _clearTimeout, _setTimeout, TimerHandler } from "@intuitionrobotics/ts-common/utils/date-time-tools";
import {LogLevel, LogParam } from "@intuitionrobotics/ts-common/core/logger/types";

export class BaseComponent<P = any, S = any>
	extends React.Component<P, S> {

	private stateKeysToUpdate?: (keyof S)[];
	private logger: Logger;
	private readonly _componentDidMount: (() => void) | undefined;
	private readonly _componentWillUnmount: (() => void) | undefined;
	private timeoutMap: { [k: string]: number } = {};

	constructor(props: P) {
		super(props);
		this.logger = new Logger(this.constructor.name);

		this._componentDidMount = this.componentDidMount;
		this.componentDidMount = () => {
			// @ts-ignore
			Thunder.getInstance().addUIListener(this);

			if (this._componentDidMount)
				this._componentDidMount();
		};

		this._componentWillUnmount = this.componentWillUnmount;
		this.componentWillUnmount = () => {
			if (this._componentWillUnmount)
				this._componentWillUnmount();

			// @ts-ignore
			Thunder.getInstance().removeUIListener(this);
		};
	}

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

	setStateKeysToUpdate(stateKeysToUpdate?: (keyof S)[]) {
		this.stateKeysToUpdate = stateKeysToUpdate;
	}

	shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
		if (!this.stateKeysToUpdate)
			return true;

		return this.stateKeysToUpdate.find(key => this.state[key] !== nextState[key]) !== undefined;
	}

	protected logVerbose(...toLog: LogParam[]): void {
		this.logImpl(LogLevel.Verbose, false, toLog);
	}

	protected logDebug(...toLog: LogParam[]): void {
		this.logImpl(LogLevel.Debug, false, toLog);
	}

	protected logInfo(...toLog: LogParam[]): void {
		this.logImpl(LogLevel.Info, false, toLog);
	}

	protected logWarning(...toLog: LogParam[]): void {
		this.logImpl(LogLevel.Warning, false, toLog);
	}

	protected logError(...toLog: LogParam[]): void {
		this.logImpl(LogLevel.Error, false, toLog);
	}

	protected log(level: LogLevel, bold: boolean, ...toLog: LogParam[]): void {
		this.logImpl(level, bold, toLog);
	}

	private logImpl(level: LogLevel, bold: boolean, toLog: LogParam[]): void {
		this.logger.log(level, bold, toLog);
	}

	static store(key: string, value: string | object): void {
		StorageModule.set(key, value);
	}

	static load(key: string, defaultValue: string | number | object | undefined): string | number | object | null {
		return StorageModule.get(key, defaultValue);
	}

	static getElementId(e: React.BaseSyntheticEvent) {
		return (e.currentTarget as HTMLElement).id;
	}

	static getImageUrl(_relativePath: string) {
		let relativePath = _relativePath;
		if (!relativePath)
			return "";

		if (relativePath.indexOf(".") === -1)
			relativePath += ".png";

		return ResourcesModule.getImageUrl(relativePath);
	}

	static getQueryParameter(name: string) {
		return BrowserHistoryModule.getQueryParam(name);
	}

	static getUrl() {
		return BrowserHistoryModule.getCurrent().pathname;
	}

	toString() {
		return this.constructor.name;
	}
}

