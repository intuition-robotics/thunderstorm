/*
 * Thunderstorm is a full web app framework!
 *
 * Typescript & Express backend infrastructure that natively runs on firebase function
 * Typescript & React frontend infrastructure
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

export enum HttpMethod {
	ALL     = "all",
	POST    = "post",
	GET     = "get",
	PATCH   = "patch",
	DELETE  = "delete",
	PUT     = "put",
	OPTIONS = "options",
	HEAD    = "head",
}

export type QueryParams = { [key: string]: string | undefined; };

export type ApiTypeBinder<U extends string | void, R extends any, B, P extends QueryParams | {}, E extends any = any> = {
	url: U
	response: R
	body: B
	queryParams: P
	error: E
};

export type ApiWithBody<U extends string, B, R, E extends any = any> = ApiTypeBinder<U, R, B, {}, E>;
export type ApiWithQuery<U extends string, R extends any, P extends QueryParams | {} = {}, E extends any = any> = ApiTypeBinder<U, R, void, P, E>;

export type DeriveResponseType<Binder extends {response?: any}> = Binder["response"];
export type DeriveBodyType<Binder extends {body?: any}> = Binder["body"];
export type DeriveUrlType<Binder extends {url: string}> = Binder["url"];
export type DeriveQueryType<Binder extends {query?: QueryParams | {}}> = Binder["query"];
export type DeriveErrorType<Binder extends {error?: any}> = Binder["error"];

export type ErrorBody<E extends object | void = void> = {
	type: string
	body: E
};

export type  ErrorResponse<E extends object | void = void> = {
	debugMessage?: string
	error?: ErrorBody<E>
}
