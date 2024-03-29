/*
 * Permissions management system, define access level for each of
 * your server apis, and restrict users by giving them access levels
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

import {Module, Second} from "@intuitionrobotics/ts-common";
import {
    BaseComponent,
    BrowserHistoryModule,
    OnUnauthenticatedResponse,
    StorageKey,
    ThunderDispatcher,
    ToastModule,
    XhrHttpModule
} from "@intuitionrobotics/thunderstorm/frontend";
import {
    AccountApi_Create,
    AccountApi_ListAccounts,
    AccountApi_Login,
    AccountApi_LoginSAML,
    AccountApi_ValidateSession,
    QueryParam_Email,
    QueryParam_JWT,
    Request_CreateAccount,
    Request_LoginAccount,
    RequestParams_LoginSAML,
    Response_Auth,
    Response_ListAccounts,
    Response_LoginSAML,
    UI_Account
} from "../../shared/api";
import {
    BaseHttpRequest,
    HeaderKey_FunctionExecutionId,
    HeaderKey_JWT,
    HttpMethod
} from "@intuitionrobotics/thunderstorm";
import {AUTHENTICATION_KEY, AUTHENTICATION_PREFIX} from "../..";

export const StorageKey_UserEmail: StorageKey<string> = new StorageKey<string>(`storage-${QueryParam_Email}`);
export const StorageKey_JWT: StorageKey<string> = new StorageKey<string>(`storage-${QueryParam_JWT}`);

export const RequestKey_AccountCreate = "account-create";
export const RequestKey_AccountLogin = "account-login";
export const RequestKey_AccountLoginSAML = "account-login-saml";
export const RequestKey_ValidateSession = "account-validate";

export interface OnLoginStatusUpdated {
    onLoginStatusUpdated: () => void;
}

export enum LoggedStatus {
    VALIDATING,
    LOGGED_OUT,
    LOGGED_IN
}

type Config = {}

export interface OnAccountsLoaded {
    __onAccountsLoaded: () => void;
}

const dispatch_onAccountsLoaded = new ThunderDispatcher<OnAccountsLoaded, "__onAccountsLoaded">("__onAccountsLoaded");

export class AccountModule_Class
    extends Module<Config> implements OnUnauthenticatedResponse {

    private status: LoggedStatus = LoggedStatus.VALIDATING;
    private dispatchUI_loginChanged!: ThunderDispatcher<OnLoginStatusUpdated, "onLoginStatusUpdated">;
    private accounts: UI_Account[] = [];

    constructor() {
        super("AccountModule");
        XhrHttpModule.addDefaultResponseHandler((request: BaseHttpRequest<any>) => {
            const status = request.getStatus();
            if (status < 200 || status >= 300)
                return false;

            try {
                const functionExecutionId = request?.getResponseHeader?.(HeaderKey_FunctionExecutionId)
                XhrHttpModule.logDebug(`${request.key} Function execution id: ${functionExecutionId}`)

                const jwt: string | undefined = request.getResponseHeader(HeaderKey_JWT);
                if (jwt)
                    StorageKey_JWT.set(jwt);
            } catch (e) {
                XhrHttpModule.logError(`${request.key} - Failed to retrieve headers from xhr call`, e)
            }
            return false;
        });
    }

    onUnauthenticatedResponse = () => {
        this.logout();
    };

    getAccounts() {
        return this.accounts;
    }

    getLoggedStatus = () => this.status;

    isStatus = (status: LoggedStatus) => this.status === status;

    protected setLoggedStatus = (newStatus: LoggedStatus) => {
        if (this.status === newStatus)
            return;

        const pervStatus = this.status;
        this.status = newStatus;
        this.logInfo(`Login status changes: ${LoggedStatus[pervStatus]} => ${LoggedStatus[newStatus]}`);
        this.dispatchUI_loginChanged.dispatchUI([]);
        this.dispatchUI_loginChanged.dispatchModule([]);
    };


    protected init(): void {
        XhrHttpModule.addDefaultHeader(AUTHENTICATION_KEY, () => `${AUTHENTICATION_PREFIX} ${StorageKey_JWT.get()}`);

        this.dispatchUI_loginChanged = new ThunderDispatcher<OnLoginStatusUpdated, "onLoginStatusUpdated">("onLoginStatusUpdated");
        const email = BaseComponent.getQueryParameter(QueryParam_Email);
        const jwt = BaseComponent.getQueryParameter(QueryParam_JWT);

        if (email && jwt) {
            StorageKey_JWT.set(jwt);
            StorageKey_UserEmail.set(email);

            BrowserHistoryModule.removeQueryParam(QueryParam_Email);
            BrowserHistoryModule.removeQueryParam(QueryParam_JWT);
        }

        if (StorageKey_JWT.get())
            return AccountModule.validateToken();

        this.logDebug("login out user.... ");
        this.setLoggedStatus(LoggedStatus.LOGGED_OUT)
    }

    public create(request: Request_CreateAccount) {
        XhrHttpModule
            .createRequest<AccountApi_Create>(HttpMethod.POST, RequestKey_AccountCreate)
            .setRelativeUrl("/v1/account/create")
            .setJsonBody(request)
            .setLabel(`User register...`)
            .setOnError("Error registering user")
            .execute(async (response: Response_Auth) => {
                ToastModule.toastSuccess(`Account successfully created with email: ${response.email}`)
            });
    }

    public login(request: Request_LoginAccount) {
        XhrHttpModule
            .createRequest<AccountApi_Login>(HttpMethod.POST, RequestKey_AccountLogin)
            .setRelativeUrl("/v1/account/login")
            .setJsonBody(request)
            .setLabel(`User login with password...`)
            .setOnError("Error login user")
            .execute(async (response: Response_Auth) => {
                this.setLoginInfo(response);
            });
    }

    private setLoginInfo(response: Response_Auth) {
        StorageKey_JWT.set(response.jwt)
        StorageKey_UserEmail.set(response.email);
        this.setLoggedStatus(LoggedStatus.LOGGED_IN);
    }

    public loginSAML(request: RequestParams_LoginSAML) {
        XhrHttpModule
            .createRequest<AccountApi_LoginSAML>(HttpMethod.GET, RequestKey_AccountLoginSAML)
            .setRelativeUrl("/v1/account/login-saml")
            .setUrlParams(request)
            .setLabel(`User login SAML...`)
            .setOnError('Error login user')
            .execute(async (response: Response_LoginSAML) => {
                if (!response.loginUrl)
                    return;

                window.location.href = response.loginUrl;
            });
    }

    private validateToken = () => {
        XhrHttpModule
            .createRequest<AccountApi_ValidateSession>(HttpMethod.GET, RequestKey_ValidateSession)
            .setLabel(`Validate token...`)
            .setRelativeUrl("/v1/account/validate")
            .setOnError((request, resError) => {
                if (request.getStatus() === 0) {
                    ToastModule.toastError("Cannot reach Server... trying in 30 sec");
                    setTimeout(() => AccountModule.validateToken(), 30 * Second);
                    return;
                }

                StorageKey_JWT.delete();
                return AccountModule.setLoggedStatus(LoggedStatus.LOGGED_OUT);
            })
            .execute(async () => {
                AccountModule.setLoggedStatus(LoggedStatus.LOGGED_IN);
            });
    };

    logout = (url?: string) => {
        StorageKey_JWT.delete();
        if (url)
            return window.location.href = url;

        this.setLoggedStatus(LoggedStatus.LOGGED_OUT);
    };

    listUsers = () => {
        XhrHttpModule
            .createRequest<AccountApi_ListAccounts>(HttpMethod.GET, RequestKey_ValidateSession)
            .setLabel(`Fetching users...`)
            .setRelativeUrl("/v1/account/query")
            .execute(async (res: Response_ListAccounts) => {
                this.accounts = res.accounts.filter(account => account._id);
                dispatch_onAccountsLoaded.dispatchUI([]);
            });

    }
}

export const AccountModule = new AccountModule_Class();
