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

import * as React from "react";
import {renderApp, WrapperProps} from "./AppWrapper";
import {BeLogged, LogClient_Browser, Module} from "@intuitionrobotics/ts-common";
import {XhrHttpModule} from "../modules/http/XhrHttpModule";
import {ToastModule} from "../modules/toaster/ToasterModule";
import {RoutingModule} from "../modules/routing/RoutingModule";
import {BrowserHistoryModule} from "../modules/HistoryModule";
import {StorageModule} from "../modules/StorageModule";
import {ResourcesModule} from "../modules/ResourcesModule";
import {RequestErrorHandler, RequestSuccessHandler} from "../../shared/request-types";
import {AbstractThunder, dispatch_requestCompleted} from "./AbstractThunder";
import {ThunderstormModule} from "../modules/ThunderstormModule";
import {DialogModule} from "../modules/dialog/DialogModule";
import {BaseHttpRequest} from "../../shared/BaseHttpRequest";
import {ThunderDispatcher} from "./thunder-dispatcher";

export const ErrorHandler_Toast: RequestErrorHandler<any> = (request, resError?) => {
    const errorMessage = request.errorMessage || resError?.debugMessage;
    return errorMessage && ToastModule.toastError(errorMessage);
};
export const SuccessHandler_Toast: RequestSuccessHandler = (request) => request.successMessage && ToastModule.toastSuccess(request.successMessage);

export const ErrorHandler_Dispatch: RequestErrorHandler<any> = (request) => dispatch_requestCompleted.dispatchUI([request.key, false, request.requestData]);
export const SuccessHandler_Dispatch: RequestSuccessHandler = (request) => dispatch_requestCompleted.dispatchUI([request.key, true, request.requestData]);

const modules: Module[] = [
    ThunderstormModule,
    XhrHttpModule,

    RoutingModule,
    BrowserHistoryModule,

    ToastModule,
    DialogModule,

    StorageModule,
    ResourcesModule
];

export interface OnUnauthenticatedResponse {
    onUnauthenticatedResponse: () => void
}

export class Thunder
    extends AbstractThunder {

    private mainApp!: React.ElementType<WrapperProps>;

    constructor() {
        super();
        this.addModules(...modules);
    }

    static getInstance(): Thunder {
        return Thunder.instance as Thunder;
    }

    init() {
        BeLogged.addClient(LogClient_Browser);

        super.init();

        XhrHttpModule.setErrorHandlers([ErrorHandler_Toast, ErrorHandler_Dispatch]);
        XhrHttpModule.setSuccessHandlers([SuccessHandler_Toast, SuccessHandler_Dispatch]);
        XhrHttpModule.addDefaultResponseHandler((request: BaseHttpRequest<any>) => {
            if (request.getStatus() !== 401)
                return false;

            new ThunderDispatcher<OnUnauthenticatedResponse, "onUnauthenticatedResponse">("onUnauthenticatedResponse").dispatchUI([]);
            return true;
        });

        return this;
    }

    protected renderApp = (): void => {
        renderApp();
    };

    public setMainApp(mainApp: React.ElementType<WrapperProps>): Thunder {
        this.mainApp = mainApp;
        return this;
    }

    public getMainApp(): React.ElementType<WrapperProps> {
        return this.mainApp;
    }
}

