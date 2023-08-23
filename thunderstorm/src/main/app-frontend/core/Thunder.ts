import * as React from "react";
import {renderApp, WrapperProps} from "./AppWrapper";
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
import { Module } from "@intuitionrobotics/ts-common/core/module";
import { LogClient_Browser } from "@intuitionrobotics/ts-common/core/logger/LogClient_Browser";
import { BeLogged } from "@intuitionrobotics/ts-common/core/logger/BeLogged";

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

            const unauthenticatedDispatcher = new ThunderDispatcher<OnUnauthenticatedResponse, "onUnauthenticatedResponse">("onUnauthenticatedResponse");
            unauthenticatedDispatcher.dispatchUI([]);
            unauthenticatedDispatcher.dispatchModule([]);
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

