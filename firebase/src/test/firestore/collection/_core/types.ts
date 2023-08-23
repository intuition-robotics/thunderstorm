import { FirestoreQuery } from "../../../../main/shared/types";

export type FB_ArrayType = {
	key: string
	value: number
}
export type SimpleType = {
	label: string
	deleteId: string
	optional?: string
};
export type FB_Type = {
	numeric: number,
	stringValue: string
	booleanValue: boolean
	stringArray: string[]
	objectArray: FB_ArrayType[]
	nestedObject?: { one: FB_ArrayType, two: FB_ArrayType }
}

export type Query_TestCase<T extends object, E extends T | T[] = T> = FirestoreQuery<T> & {
	insert?: T[]
	label: string,
	expected: E extends T ? Partial<T> : Partial<T>[]
}

export type Patch_TestCase<T extends object> = {
	insert: T,
	override: T,
	query: FirestoreQuery<T>
	label: string,
}
