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

export type ApiTypeBinder<U extends string | void, R extends any, B, P extends QueryParams | {}, E extends any = any> = {};
export type ApiWithBody<U extends string, B, R, E extends any = any> = ApiTypeBinder<U, R, B, {}, E>;
export type ApiWithQuery<U extends string, R extends any, P extends QueryParams | {} = {}, E extends any = any> = ApiTypeBinder<U, R, void, P, E>;

export type DeriveResponseType<Binder> = Binder extends ApiTypeBinder<any, infer R, any, any> ? R : Binder;
export type DeriveBodyType<Binder> = Binder extends ApiTypeBinder<any, any, infer B, any> ? B : Binder;
export type DeriveUrlType<Binder> = Binder extends ApiTypeBinder<infer U, any, any, any> ? U extends string ? U : string : Binder;
export type DeriveQueryType<Binder> = Binder extends ApiTypeBinder<any, any, any, infer P> ? P extends QueryParams ? P : "Invalid property in QueryParams.. must be { [key: string]: string | undefined; }" : Binder;
export type DeriveErrorType<Binder> = Binder extends ApiTypeBinder<any, any, any, any, infer E> ? E extends object ? E : void : Binder;

export type ErrorBody<E extends object | void = void> = {
	type: string
	body: E
};

export type  ErrorResponse<E extends object | void = void> = {
	debugMessage?: string
	error?: ErrorBody<E>
}
