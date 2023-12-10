import {ApiTypeBinder, ErrorResponse, HttpMethod, QueryParams} from "../../../shared/types";
import {_keys, BadImplementationException, currentTimeMillies} from "@intuitionrobotics/ts-common";
import {gzipSync} from "zlib";
import {HttpException} from "../../../shared/request-types";
import {BaseHttpRequest} from "../../../shared/BaseHttpRequest";
import {BaseHttpModule_Class} from "../../../shared/BaseHttpModule";

export class XhrHttpModule_Class
    extends BaseHttpModule_Class {

    constructor(name?: string) {
        super(name || "XhrHttpModule");
    }

    init() {
        super.init();
        const origin = this.config.origin;
        if (!origin)
            throw new BadImplementationException("Did you forget to set the origin config key for the HttpModule?");

        this.origin = origin;
    }

    createRequest<Binder extends ApiTypeBinder<U, R, B, P, E>,
        U extends string = Binder["url"],
        R = Binder["response"],
        B = Binder["body"],
        P extends QueryParams = Binder["queryParams"],
        E extends void | object = Binder["error"]>(method: HttpMethod, key: string, data?: string): BaseHttpRequest<Binder> {
        return new XhrHttpRequest<Binder>(key, data, this.shouldCompress())
            .setOrigin(this.origin)
            .setMethod(method)
            .setTimeout(this.timeout)
            .setDefaultHeaders(this.defaultHeaders)
            .setHandleRequestSuccess(this.handleRequestSuccess)
            .setHandleRequestFailure(this.handleRequestFailure)
            .setDefaultRequestHandler(this.processDefaultResponseHandlers);
    }

}

export const XhrHttpModule = new XhrHttpModule_Class();

class XhrHttpRequest<
    Binder extends ApiTypeBinder<U, R, B, P, E>,
    U extends string = Binder["url"],
    R = Binder["response"],
    B = Binder["body"],
    P extends QueryParams = Binder["queryParams"],
    E extends void | object = Binder["error"]
>
    extends BaseHttpRequest<Binder> {

    private readonly xhr?: XMLHttpRequest;
    private startTime?: number;
    private elapsedMS?: number;

    constructor(requestKey: string, requestData?: string, shouldCompress?: boolean) {
        super(requestKey, requestData);
        this.compress = shouldCompress === undefined ? true : shouldCompress;
    }

    getStatus(): number {
        const xhr = this.xhr;
        if (!xhr)
            throw new BadImplementationException("No xhr object!");

        return xhr.status;
    }

    protected getResponse() {
        const xhr = this.xhr;
        if (!xhr)
            throw new BadImplementationException("No xhr object!");

        return xhr.response;
    }

    protected abortImpl(): void {
        this.xhr?.abort();
    }

    getErrorResponse(): ErrorResponse<E> {
        const rawResponse = this.getResponse();
        let response = undefined as unknown as ErrorResponse<E>;
        if (rawResponse) {
            try {
                response = rawResponse && this.asJson() as unknown as ErrorResponse<E>;
            } catch (e) {
                response = {debugMessage: rawResponse};
            }
        }
        return response;
    }

    protected prepareJsonBody(bodyObject: any) {
        return JSON.stringify(bodyObject);
    }

    protected executeImpl(): Promise<void> {
        //loop through whatever preprocessor
        return new Promise<void>((resolve, reject) => {
            if (this.aborted)
                return resolve();

            const xhr = new XMLHttpRequest();
            // @ts-ignore
            // noinspection JSConstantReassignment
            this.xhr = xhr;
            this.xhr.onreadystatechange = () => {
                if (xhr.readyState !== 4)
                    return;

                if (this.startTime)
                    this.elapsedMS = currentTimeMillies() - this.startTime;

                resolve();
            };

            this.xhr.onerror = (err) => {
                if (xhr.readyState === 4 && xhr.status === 0) {
                    reject(new HttpException(404, this.url));
                    return;
                }

                reject(err);
            };

            this.xhr.ontimeout = (err) => {
                reject(err);
            };

            this.xhr.onload = (err) => {
                // HttpModule.logVerbose("onload");
            };

            this.xhr.onloadstart = (err) => {
                // HttpModule.logVerbose("onloadstart");
            };

            this.xhr.onloadend = (err) => {
                // HttpModule.logVerbose("onloadend");
            };

            this.xhr.onabort = (err) => {
                // HttpModule.logVerbose("onabort");
            };

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


            // TODO: investigate which one should work
            this.xhr.onprogress = this.onProgressListener;
            this.xhr.upload.onprogress = this.onProgressListener;

            this.xhr.open(this.method, fullUrl);
            this.xhr.timeout = this.timeout;

            Object.keys(this.headers).forEach((key) => {
                xhr.setRequestHeader(key, this.headers[key].join("; "));
            });

            let body: any = this.body;
            if (typeof body === 'string' && this.compress)
                try {
                    body = gzipSync(body);
                } catch (error) {
                    return reject(error);
                }

            this.startTime = currentTimeMillies();
            return this.xhr.send(body);
        });
    }

    getAllResponseHeaders() {
        return this.xhr?.getAllResponseHeaders();
    }

    getResponseHeader(headerKey: string): string | undefined {
        if (!this.xhr)
            throw new BadImplementationException("No xhr object!");

        if (!this.xhr.response)
            throw new BadImplementationException(`xhr didn't return yet`);

        // Chrome bug, if the response header is not present then it throws an error (not really problematic but just annoying)
        // https://trackjs.com/blog/refused-unsafe-header/
        if (this.xhr.getAllResponseHeaders().indexOf(headerKey) < 0)
            return undefined;

        const header = this.xhr.getResponseHeader(headerKey);
        if (!header)
            return undefined;

        return header;
    }

    getElapsedTime = () => this.elapsedMS;
}
