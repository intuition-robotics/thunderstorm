import {_keys} from "./object-tools";
import {ObjectTS} from "./types";

export function regexpCase(value: string, reg: string) {
	return value.match(new RegExp(reg)) || {input: undefined};
}

export function createFilterPattern(rawFilter?: string) {
	let filter = rawFilter || "";
	filter = filter.trim();
	filter = filter.replace(/\s+/, " ");
	filter = filter.replace(new RegExp("(.)", "g"), ".*?$1");
	filter.length === 0 ? filter = ".*?" : filter += ".*";
	return filter;
}

export function calculateJsonSizeMb(data: ObjectTS) {
	const number = JSON.stringify(data).length / 1024 / 1024;
	return Math.round(number * 100) / 100;
}

export function __stringify<T>(obj: T, pretty?: boolean | (keyof T)[]): string {
	if (Array.isArray(pretty) && typeof obj == "object") {
		return `${_keys(obj as unknown as object).reduce((carry: string, key: keyof T, idx: number) => {
			// @ts-ignore
			return carry + `  ${String(key)}: ${__stringify(obj[key], pretty.includes(key))}${idx !== _keys(obj).length - 1 && ',\n'}`;
		}, `{\n`)}\n}`;
	}

	if (pretty)
		return JSON.stringify(obj, null, 2);

	return JSON.stringify(obj);
}
