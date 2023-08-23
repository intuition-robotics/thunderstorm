import { sortArray } from "../utils/array-tools";
import {deepClone} from "../utils/object-tools";

export class PermissionCategory<P extends number> {
	readonly key: string;
	readonly levels: string[];
	readonly permissionsEnum: any;
	readonly defaultValue: P;

	constructor(key: string, permissionsEnum: any, defaultValue: P) {
		this.key = key;
		this.permissionsEnum = permissionsEnum;
		this.defaultValue = defaultValue;

		const _levels: string[] = Object.keys(permissionsEnum).filter(value => isNaN(parseInt(value)));
		this.levels = sortArray(_levels, (_key: string) => permissionsEnum[_key]).reverse();
	}

	getClosestMatch(permission: number) {
		return deepClone(this.levels).reverse().find(((level: string) => this.permissionsEnum[level] <= permission))
	}
}
