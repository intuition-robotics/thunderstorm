import axios from 'axios';
import {ApiTypeBinder, ErrorResponse, HttpMethod, QueryParams} from "../../../shared/types";
import {_keys, BadImplementationException, StringMap,} from "@intuitionrobotics/ts-common";
import {BaseHttpRequest} from "../../../shared/BaseHttpRequest";
import {BaseHttpModule_Class, HttpConfig} from "../../../shared/BaseHttpModule";
import {Axios_CancelTokenSource, Axios_Method, Axios_RequestConfig, Axios_Response, Axios_ResponseType} from "./types";
import * as fs from "fs";

export class AxiosHttpModule_Class
    extends BaseHttpModule_Class {
    private requestOption: Axios_RequestConfig = {};

    constructor(name?: string) {
        super(name || "AxiosHttpModule");
    }

    init() {
        super.init()
        const origin = this.config.origin;
        if (origin)
            this.origin = origin;
    }

    createRequest<Binder extends ApiTypeBinder<U, R, B, P, E>,
        U extends string = Binder["url"],
        R = Binder["response"],
        B = Binder["body"],
        P extends QueryParams = Binder["queryParams"],
        E extends void | object = Binder["error"]>(method: HttpMethod, key: string, data?: string): BaseHttpRequest<Binder> {
        return new AxiosHttpRequest<Binder>(key, data, this.shouldCompress())
            .setOrigin(this.origin)
            .setMethod(method)
            .setTimeout(this.timeout)
            .setDefaultHeaders(this.defaultHeaders)
            .setHandleRequestSuccess(this.handleRequestSuccess)
            .setHandleRequestFailure(this.handleRequestFailure)
            .setDefaultRequestHandler(this.processDefaultResponseHandlers)
            .setRequestOption(this.requestOption);
    }

    setRequestOption(requestOption: Axios_RequestConfig) {
        this.requestOption = requestOption;
        return this;
    }

    async downloadFile(url: string, outputFile: string, key = `Download file: ${url}`) {
        const downloadRequest = await this.createRequest(HttpMethod.GET, key)
            .setResponseType("arraybuffer")
            .setUrl(url);


        const downloadResponse = await downloadRequest.executeSync();
        const outputFolder = outputFile.substring(0, outputFile.lastIndexOf("/"));
        if (!fs.existsSync(outputFolder))
            fs.mkdirSync(outputFolder);

        fs.writeFileSync(outputFile, downloadResponse as any);
        return outputFile;
    }

}

export type DeriveRealBinder<Binder> = Binder extends ApiTypeBinder<infer U, infer R, infer B, infer P> ? ApiTypeBinder<U, R, B, P> : void;

export const AxiosHttpModule = new AxiosHttpModule_Class();

class AxiosHttpRequest<Binder extends ApiTypeBinder<U, R, B, P, E>,
    U extends string = Binder["url"],
    R = Binder["response"],
    B = Binder["body"],
    P extends QueryParams = Binder["queryParams"],
    E extends void | object = Binder["error"]>
    extends BaseHttpRequest<Binder> {
    private response?: Axios_Response<R>;
    private cancelSignal: Axios_CancelTokenSource;
    protected status?: number;
    private requestOption: Axios_RequestConfig = {};

    constructor(requestKey: string, requestData?: string, shouldCompress?: boolean) {
        super(requestKey, requestData);
        this.compress = shouldCompress === undefined ? false : shouldCompress;

        this.cancelSignal = axios.CancelToken.source();
    }

    getStatus(): number {
        if (!this.status)
            throw new BadImplementationException('Missing status..');

        return this.status;
    }

    getResponse(): any {
        return this.response?.data;
    }

    protected resolveResponse() {
        return this.getResponse();
    }

    protected abortImpl(): void {
        this.cancelSignal.cancel(`Request with key: '${this.key}' aborted by the user.`);
    }

    getErrorResponse(): ErrorResponse<E> {
        return {debugMessage: this.getResponse()};
    }

    setRequestOption(requestOption: Axios_RequestConfig) {
        this.requestOption = requestOption;
        return this;
    }

    protected executeImpl(): Promise<void> {
        //loop through whatever preprocessor
        return new Promise<void>(async (resolve, reject) => {
            if (this.aborted)
                return resolve();

            let nextOperator = this.url.indexOf("?") === -1 ? "?" : "&";
            let fullUrl = this.url;
            const params = this.params;
            if (params)
                fullUrl = _keys(params).reduce((url: string, paramKey) => {
                    const param: string | undefined = params[paramKey];
                    if (!param)
                        return url;

                    const toRet = `${url}${nextOperator}${String(paramKey)}=${encodeURIComponent(param)}`;
                    nextOperator = "&";
                    return toRet;
                }, this.url);

            // TODO set progress listener
            // this.xhr.upload.onprogress = this.onProgressListener;
            const body = this.body as any;
            if (body) {
                const length = typeof body === 'string' ? body.length : JSON.stringify(body).length;
                this.addHeader("Content-Length", `${length}`);
            }

            // TODO add zipping of body
            // if (typeof body === "string" && this.compress)
            // 	return gzip(body, (error: Error | null, result: Buffer) => {
            // 		if (error)
            // 			return reject(error);
            //
            // 		xhr.send(result);
            // 	});
            //
            // this.xhr.send(body as BodyInit);

            const headers = Object.keys(this.headers).reduce((carry: StringMap, headerKey: string) => {
                carry[headerKey] = this.headers[headerKey].join('; ');
                return carry;
            }, {} as StringMap);

            const options: Axios_RequestConfig = {
                ...this.requestOption,
                url: fullUrl,
                method: this.method as Axios_Method,
                headers: headers,
                // TODO will probably need to use the abortController with a timeout for this.
                timeout: this.timeout,
                cancelToken: this.cancelSignal.token
            };

            if (body)
                options.data = body;

            if (this.responseType)
                options.responseType = this.responseType as Axios_ResponseType;

            try {
                this.response = await axios.request(options);
                this.status = this.response?.status || 200;
                return resolve();
            } catch (e) {
                if (!(e instanceof axios.AxiosError)) {
                    this.status = 500;
                    return reject(e);
                }

                if (axios.isCancel(e)) {
                    // Should already be set when I abort but just in case its aborted somehow else
                    this.aborted = true;
                    console.log('Api cancelled: ', e.message);
                }

                this.response = e["response"];
                this.status = this.response?.status || 500;
                return reject(e);
            }
        });
    }

    getResponseHeader(headerKey: string): string | undefined {
        if (!this.response)
            throw new BadImplementationException(`axios didn't return yet`);

        return this.response.headers[headerKey];
    }
}


export class AxiosHttpClient
    extends BaseHttpModule_Class {
    private requestOption: Axios_RequestConfig = {};

    constructor(name: string, config: HttpConfig) {
        super(name);
        this.setConfig(config);
        super.init()
        const origin = this.config.origin;
        if (origin)
            this.origin = origin;
    }

    createRequest<Binder extends ApiTypeBinder<U, R, B, P, E>,
        U extends string = Binder["url"],
        R = Binder["response"],
        B = Binder["body"],
        P extends QueryParams = Binder["queryParams"],
        E extends void | object = Binder["error"]>(method: HttpMethod, key: string, data?: string): BaseHttpRequest<Binder> {
        return new AxiosHttpRequest<Binder>(key, data, this.shouldCompress())
            .setOrigin(this.origin)
            .setMethod(method)
            .setTimeout(this.timeout)
            .setDefaultHeaders(this.defaultHeaders)
            .setHandleRequestSuccess(this.handleRequestSuccess)
            .setHandleRequestFailure(this.handleRequestFailure)
            .setDefaultRequestHandler(this.processDefaultResponseHandlers)
            .setRequestOption(this.requestOption);
    }

    setRequestOption(requestOption: Axios_RequestConfig) {
        this.requestOption = requestOption;
        return this;
    }

}

