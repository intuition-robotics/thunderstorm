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

export function removeItemFromArray<T>(array: T[], item: T) {
	const index = array.indexOf(item);
	return removeFromArrayByIndex(array, index);
}

export function removeFromArray<T>(array: T[], item: (_item: T) => boolean) {
	const index = array.findIndex(item);
	return removeFromArrayByIndex(array, index);
}

export function removeFromArrayByIndex<T>(array: T[], index: number) {
	if (index > -1)
		array.splice(index, 1);

	return array;
}

export function addAllItemToArray<T>(array: T[], items: T[]) {
	array.push(...items);
	return array;
}

export function addItemToArray<T>(array: T[], item: T) {
	array.push(item)
	return array;
}

export function addItemToArrayAtIndex<T>(array: T[], item: T, index: number) {
	array.splice(index, 0, item);
	return array;
}

export function toggleElementInArray<T>(array: T[], item: T) {
	const index = array.indexOf(item);
	if (index > -1)
		array.splice(index, 1);
	else
		array.push(item);

	return array;
}

export function filterDuplicates<T>(array: T[]): T[] {
	return Array.from(new Set(array));
}

export function filterInstances<T>(array: (T | undefined | null | void)[]): T[] {
	return array.filter(item => !!item) as T[];
}

export function arrayToMap<T extends object>(array: T[], getKey: (item: T) => string, map?: { [k: string]: T }): { [k: string]: T } {
	return array.reduce((toRet, element) => {
		toRet[getKey(element)] = element;
		return toRet;
	}, map || {});
}

// updateProperty<T extends object>(map: { [k: string]: T }, getKey: (element: T) => string, elements: T[]) {
// }


export function sortArray<T>(array: T[], map: (item: T) => any, invert = false) {
	const compareFn = (a: T, b: T) => {
		const _a = map(a);
		const _b = map(b);
		return (_a > _b ? -1 : (_a === _b ? 0 : 1)) * (invert ? -1 : 1);
	};

	return array.sort(compareFn);
}

export async function batchAction<T extends any = any, R extends any = any>(arr: T[], chunk: number, action: (elements: T[], chunkNumber: number) => Promise<R | R[]>): Promise<R[]> {
	if (chunk <= 0)
		return []

	const result: R[] = [];
	for (let i = 0, j = arr.length; i < j; i += chunk) {
		const items: R[] | R = await action(arr.slice(i, i + chunk), i / chunk);
		if (Array.isArray(items))
			addAllItemToArray(result, items);
		else
			addItemToArray(result, items);
	}
	return result;
}

export async function batchActionParallel<T extends any = any, R extends any = any>(arr: T[], chunk: number, action: (elements: T[], chunkNumber: number) => Promise<R | R[]>): Promise<R[]> {

	if (chunk <= 0)
		return []

	const promises: Promise<R>[] = [];
	for (let i = 0, j = arr.length; i < j; i += chunk) {
		addItemToArray(promises, action(arr.slice(i, i + chunk), i / chunk));
	}

	const toRet: R[] = [];
	const results = await Promise.all(promises);
	for (const items of results) {
		if (Array.isArray(items))
			addAllItemToArray(toRet, items);
		else
			addItemToArray(toRet, items);
	}

	return toRet;
}

export function flatArray<T>(arr: T[][] | T[], result: T[] = []): T[] {
	for (let i = 0, length = arr.length; i < length; i++) {
		const value = arr[i];
		if (Array.isArray(value)) {
			flatArray(value, result);
		} else {
			result.push(value);
		}
	}
	return result;
};
