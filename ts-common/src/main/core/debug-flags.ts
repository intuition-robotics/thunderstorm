

import {
	addItemToArray,
	removeItemFromArray
} from "../utils/array-tools";

export class DebugFlag {

	private readonly key: string;

	private constructor(key: string) {
		this.key = key;
		DebugFlags.add(this);
	}

	rename(newKey: string) {
		DebugFlags.rename(this.key, newKey);
	}

	getKey() {
		return this.key;
	}

	enable(enable = true) {
		if (this.isEnabled() === enable)
			return;

		if (enable)
			this._enable();
		else
			this._disable();
	}

	private _enable() {
		addItemToArray(DebugFlags.instance.ActiveDebugFlags, this.key);
	}

	private _disable() {
		removeItemFromArray(DebugFlags.instance.ActiveDebugFlags, this.key);
	}

	public isEnabled() {
		return DebugFlags.instance.ActiveDebugFlags.includes(this.key);
	}
}

export class DebugFlags {

	static readonly instance: DebugFlags = new DebugFlags();

	readonly AllDebugFlags: { [k: string]: DebugFlag } = {};
	readonly ActiveDebugFlags: string[] = [];

	private constructor() {
	}

	public static createFlag(key: string) {
		// @ts-ignore
		return new DebugFlag(key);
	}

	static add(flag: DebugFlag) {
		this.instance.AllDebugFlags[flag.getKey()] = flag;
	}

	static rename(previousKey: string, newKey: string) {
		const flag = this.instance.AllDebugFlags[previousKey];
		if (!flag)
			return;

		delete this.instance.AllDebugFlags[previousKey];
		this.instance.AllDebugFlags[newKey] = flag;
	}
}
