import {
	RequireOptionals,
	MandatoryKeys,
    DB_Object
} from "@intuitionrobotics/ts-common/utils/types";

export type Firebase_Message = {
	token?: string,
	topic?: string,
	condition?: string
};

export interface Firebase_Messaging {
	send(message: Firebase_Message, dryRun?: boolean): Promise<string>;
}

export type FirebaseConfig = {
	id: string,
	projectId: string;
	apiKey: string,
	authDomain: string,
	databaseURL?: string,
	storageBucket?: string,
	messagingSenderId: string
}

type Comparator = "in" | "array-contains" | "array-contains-any" | ">" | ">=" | "<" | "<=" | "==";
export type DB_RequestObject = Partial<DB_Object>

export type QueryComparator<T> =
	{ $ac: T extends (infer I)[] ? I : never } |
	{ $aca: T extends (infer I)[] ? I[] : never } |
	{ $nin: T extends (infer I)[] ? never : T[] } |
	{ $in: T extends (infer I)[] ? never : T[] } |
	{ $gt: number } |
	{ $gte: number } |
	{ $lt: number } |
	{ $lte: number } |
	{ $eq: T } |
	{ $neq: T } ;

export const ComparatorMap: { [k in keyof QueryComparator<any>]: Comparator } = {
	$nin: "not-in",
	$in: "in",
	$ac: "array-contains",
	$aca: "array-contains-any",
	$gt: ">",
	$gte: ">=",
	$lt: "<",
	$lte: "<=",
	$eq: "==",
	$neq: "!=",
};

export type FilterKeys<T extends object> = MandatoryKeys<T, string | number>[];
export type FirestoreType_OrderByDirection = 'desc' | 'asc';
export type WhereValue<Value> = QueryComparator<Value> | (Value extends object ? Clause_Where<Value> : Value | [Value])  ;
export type Clause_Where<T extends object> = { [P in keyof T]?: WhereValue<T[P]> }
export type Clause_OrderBy<T extends object> = [{ key: keyof T, order: FirestoreType_OrderByDirection }];
export type Clause_Select<T extends object, K extends keyof T = keyof T> = K[];

export type FirestoreQuery<T extends object> = RequireOptionals<FirestoreQueryImpl<T>>
export type FirestoreQueryImpl<T extends object> = {
	select?: Clause_Select<T>
	orderBy?: Clause_OrderBy<T>
	where?: Clause_Where<T>
	limit?: number
}

export type FirebaseProjectCollections = { projectId: string, collections: string[] };
