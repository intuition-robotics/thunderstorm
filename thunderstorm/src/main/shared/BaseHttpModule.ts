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
// noinspection TypeScriptPreferShortImport
import {ApiTypeBinder, ErrorResponse, HttpMethod} from "./types";

import {addItemToArray, Module, removeItemFromArray,} from "@intuitionrobotics/ts-common";
// noinspection TypeScriptPreferShortImport
import {RequestErrorHandler, RequestSuccessHandler, ResponseHandler} from "./request-types";
// noinspection TypeScriptPreferShortImport
import {BaseHttpRequest} from "./BaseHttpRequest";

type HttpConfig = {
    origin?: string
    timeout?: number
    compress?: boolean
}
export type DeriveRealBinder<Binder> = Binder extends ApiTypeBinder<infer U, infer R, infer B, infer P> ? ApiTypeBinder<U, R, B, P> : void;

export abstract class BaseHttpModule_Class<Config extends HttpConfig = HttpConfig>
    extends Module<Config> {

    private defaultErrorHandlers: RequestErrorHandler<any>[] = [];
    private defaultSuccessHandlers: RequestSuccessHandler[] = [];

    protected origin?: string;
    protected timeout: number = 10000;
    private readonly defaultResponseHandler: ResponseHandler[] = [];
    protected readonly defaultHeaders: { [s: string]: (() => string | string[]) | string | string[] } = {};

    constructor(name: string) {
        super(name);
        this.setDefaultConfig({compress: true} as Partial<Config>);
    }

    init() {
        this.timeout = this.config.timeout || this.timeout;
    }

    shouldCompress() {
        return this.config.compress;
    }

    addDefaultHeader(key: string, header: (() => string | string[]) | string | string[]) {
        this.defaultHeaders[key.toLowerCase()] = header;
    }

    abstract createRequest<Binder extends ApiTypeBinder<any, any, any, any> = ApiTypeBinder<void, void, void, {}>>(method: HttpMethod, key: string, data?: string): BaseHttpRequest<DeriveRealBinder<Binder>, any>

    processDefaultResponseHandlers = (httpRequest: BaseHttpRequest<any>) => {
        let resolved = false;
        for (const responseHandler of this.defaultResponseHandler) {
            resolved = resolved || responseHandler(httpRequest);
        }

        return resolved;
    };

    addDefaultResponseHandler(defaultResponseHandler: ResponseHandler) {
        addItemToArray(this.defaultResponseHandler, defaultResponseHandler);
    }

    removeDefaultResponseHandler(defaultResponseHandler: ResponseHandler) {
        removeItemFromArray(this.defaultResponseHandler, defaultResponseHandler);
    }

    setErrorHandlers(defaultErrorHandlers: RequestErrorHandler<any>[]) {
        this.defaultErrorHandlers = defaultErrorHandlers;
    }

    setSuccessHandlers(defaultErrorHandlers: RequestSuccessHandler[]) {
        this.defaultSuccessHandlers = defaultErrorHandlers;
    }

    handleRequestFailure: RequestErrorHandler<any> = (request: BaseHttpRequest<any>, resError?: ErrorResponse<any>) => {
        const feError = request.getErrorMessage();
        const beError = resError?.debugMessage;

        this.logError(`Http request for key '${request.key}' failed...`);
        if (feError)
            this.logError(` + FE error:  ${feError}`);

        if (beError)
            this.logError(` + BE error:  ${beError}`);

        for (const errorHandler of this.defaultErrorHandlers) {
            errorHandler(request, resError);
        }
    };

    handleRequestSuccess: RequestSuccessHandler = (request: BaseHttpRequest<any>) => {
        const feMessage = request.getSuccessMessage();

        this.logInfo(`Http request for key '${request.key}' completed`);
        if (feMessage)
            this.logInfo(` + FE message:  ${feMessage}`);

        for (const successHandler of this.defaultSuccessHandlers) {
            successHandler(request);
        }
    };
}
