
import {ApiException} from "../exceptions";

export const assertProperty = <T extends object, K extends keyof T = keyof T>(instance: T, key: K | K[], statusCode: number = 400, check?: string | ((propValue: T[K]) => void)): void => {
	if (Array.isArray(key))
		return key.forEach(k => assertProperty(instance, k, statusCode, check));

	const _key: K = key;
	const value = instance[_key];
	if (!value)
		throw new ApiException(statusCode, `Missing <strong>${key}</strong>`);

	if (!check)
		return;

	if (typeof value === "number")
		return;

	if (typeof value === "string") {
		if (typeof check === "string") {
			if (value.match(check))
				return;

			throw new ApiException(statusCode, `Value <strong>${value}</strong> doesn't match with check: ${check}`)
		}

		return check(value);
	}

	if (typeof value === "object" && typeof check === "function")
		check(value)
};
