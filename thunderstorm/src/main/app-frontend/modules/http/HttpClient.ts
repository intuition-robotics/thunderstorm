//
// import {
// 	__stringify,
// 	StringMap
// } from "@intuitionrobotics/ts-common";
// import {
// 	ErrorResponse,
// 	HttpMethod
// } from "../../..";
// import {
// 	ApiException,
// 	promisifyRequest,
// 	RequestOptions
// } from "../../../backend";
//
// export const createFormData = (filename: string, buffer: Buffer) => ({file: {value: buffer, options: {filename}}});
//
// export class HttpClient {
//
// 	private defaultHeaders!: Headers;
// 	private readonly baseUrl: string;
//
// 	constructor(baseUrl: string) {
// 		this.baseUrl = baseUrl;
// 	}
//
// 	setDefaultHeaders(defaultHeaders: Headers) {
// 		this.defaultHeaders = defaultHeaders
// 	}
//
// 	form(path: string, buffer: Buffer, headers?: Headers) {
// 		const request: RequestOptions = {
// 			headers: {...this.defaultHeaders, headers},
// 			uri: `${this.baseUrl}${path}`,
// 			formData: createFormData('logs.zip', buffer),
// 			method: HttpMethod.POST,
// 		};
// 		return this.executeRequest(request);
// 	}
//
// 	get(path: string, _params?: StringMap, headers?: Headers) {
// 		let url = `${this.baseUrl}${path}`;
//
// 		let nextOperator = "?";
// 		if (url.indexOf("?") !== -1)
// 			nextOperator = "&";
//
// 		if (_params)
// 			url = Object.keys(_params).reduce((fullUrl: string, paramKey: string) => {
// 				const param: string | undefined = _params[paramKey];
// 				if (!param)
// 					return url;
//
// 				const temp = `${fullUrl}${nextOperator}${paramKey}=${encodeURIComponent(param)}`;
// 				nextOperator = "&";
// 				return temp;
// 			}, url);
//
// 		const request: RequestOptions = {
// 			headers: {...this.defaultHeaders, headers},
// 			uri: `${url}`,
// 			method: HttpMethod.GET,
// 			json: true
// 		};
// 		return this.executeRequest(request);
// 	}
//
// 	post(path: string, body: any, headers?: Headers) {
// 		const request: RequestOptions = {
// 			headers: {...this.defaultHeaders, ...headers},
// 			uri: `${this.baseUrl}${path}`,
// 			body,
// 			method: HttpMethod.POST,
// 			json: true
// 		};
// 		return this.executeRequest(request);
//
// 	}
//
// 	put(path: string, body: any, headers?: Headers) {
// 		const request: RequestOptions = {
// 			headers: {...this.defaultHeaders, headers},
// 			uri: `${this.baseUrl}${path}`,
// 			body,
// 			method: HttpMethod.PUT,
// 			json: true
// 		};
// 		return this.executeRequest(request);
// 	}
//
// 	private executeRequest = async (body: RequestOptions) => {
// 		const response = await promisifyRequest(body);
// 		const statusCode = response.status;
// 		if (statusCode >= 200 && statusCode < 300)
// 			return response.data;
//
// 		const errorResponse: ErrorResponse<any> = response.data;
// 		if (!errorResponse)
// 			throw new ApiException(statusCode, `Http request failed without error message: ${__stringify(body, true)}`);
//
// 		throw new ApiException<any>(statusCode, `Http request failed: ${errorResponse} \n For Request: ${__stringify(body, true)}`);
// 	};
// }
