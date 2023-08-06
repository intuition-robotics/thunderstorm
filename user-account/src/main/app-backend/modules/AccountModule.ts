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
import {
    __stringify,
    auditBy,
    BadImplementationException,
    currentTimeMillies,
    Day,
    Dispatcher,
    generateHex,
    hashPasswordWithSalt,
    Minute,
    Module,
    validate,
    validateEmail
} from "@intuitionrobotics/ts-common";


import {FirebaseModule, FirestoreCollection, FirestoreTransaction} from "@intuitionrobotics/firebase/backend";
import {
    DB_Account,
    DB_Session,
    FrontType,
    HeaderKey_SessionId,
    PostAssertBody,
    QueryParam_Email,
    QueryParam_JWT,
    QueryParam_RedirectUrl,
    QueryParam_SessionId,
    Request_CreateAccount,
    Request_LoginAccount,
    Request_UpsertAccount,
    RequestBody_SamlAssertOptions,
    Response_Auth,
    Response_Validation,
    UI_Account,
    UI_Session
} from "./_imports";
import {
    ApiException,
    ApiResponse,
    ExpressRequest,
    HeaderKey,
    QueryRequestInfo
} from "@intuitionrobotics/thunderstorm/backend";
import {SecretsModule} from "./SecretsModule";
import {SamlModule} from "./SamlModule";
import {HeaderKey_JWT} from "@intuitionrobotics/thunderstorm";

export const Header_SessionId = new HeaderKey(HeaderKey_SessionId, 404);

type Config = {
    projectId: string
    sessionTTLms: { web: number, app: number, jwt: number }
    jwtSecretKey: string
}

export const Collection_Sessions = "user-account--sessions";
export const Collection_Accounts = "user-account--accounts";

export interface OnNewUserRegistered {
    __onNewUserRegistered(account: UI_Account): void;
}

export interface OnUserLogin {
    __onUserLogin(account: UI_Account): void;
}

const dispatch_onUserLogin = new Dispatcher<OnUserLogin, "__onUserLogin">("__onUserLogin");
const dispatch_onNewUserRegistered = new Dispatcher<OnNewUserRegistered, "__onNewUserRegistered">("__onNewUserRegistered");

function getUIAccount(account: DB_Account): UI_Account {
    const {email, _id} = account;
    return {email, _id};
}

export class AccountsModule_Class
    extends Module<Config>
    implements QueryRequestInfo {
    constructor() {
        super("AccountsModule");
        this.setDefaultConfig({sessionTTLms: {web: Day, app: Day, jwt: 30 * Minute}, jwtSecretKey: "TS_AUTH_SECRET"});
    }

    async __queryRequestInfo(request: ExpressRequest): Promise<{ key: string; data: any; }> {
        let data: UI_Account | undefined;
        try {
            data = await this.validateSession(request);
        } catch (e) {
        }

        return {
            key: this.getName(),
            data: data
        };
    }

    private sessions!: FirestoreCollection<DB_Session>;
    private accounts!: FirestoreCollection<DB_Account>;

    protected init(): void {
        const firestore = FirebaseModule.createAdminSession(this.config.projectId).getFirestore();
        this.sessions = firestore.getCollection<DB_Session>(Collection_Sessions, ["userId"]);
        this.accounts = firestore.getCollection<DB_Account>(Collection_Accounts, ["email"]);
    }

    async getUser(_email: string): Promise<UI_Account | undefined> {
        const email = _email.toLowerCase();
        return this.accounts.queryUnique({
            where: {email},
            select: ["email",
                "_id"]
        });
    }

    async listUsers(): Promise<UI_Account[]> {
        return this.accounts.getAll(["_id",
            "email"]);
    }

    async listSessions() {
        return this.sessions.getAll(["userId",
            "timestamp"]);
    }

    async getSession(_email: string) {
        const email = _email.toLowerCase();
        return this.accounts.queryUnique({where: {email}});
    }

    async querySessions(_email: string): Promise<UI_Session[] | undefined> {
        const account = await this.getSession(_email);
        if (!account)
            return;

        const sessions = await this.sessions.query({
            select: ["userId",
                "timestamp",
                "version",
                "frontType"], where: {userId: account._id}
        });
        return sessions.map((session: DB_Session) => {
            return {
                ...session,
                isExpired: this.TTLExpired(session)
            }
        });
    }

    async create(request: Request_CreateAccount, response: ApiResponse) {
        const account = await this.createAccount(request);

        const session = await this.login(request, response);
        await dispatch_onNewUserRegistered.dispatchModuleAsync([getUIAccount(account)]);
        return session;
    }

    async upsert(request: Request_UpsertAccount) {
        let callback: (() => Promise<void[]>) = () => Promise.resolve([])
        const account = await this.accounts.runInTransaction(async (transaction) => {
            const existAccount = await transaction.queryUnique(this.accounts, {where: {email: request.email}});
            if (existAccount)
                return this.changePassword(request.email, request.password, transaction);

            callback = async () => dispatch_onNewUserRegistered.dispatchModuleAsync([getUIAccount(account)]);
            return this.createImpl(request, transaction);
        });

        await this.loginValidate(request);
        await callback()
        return getUIAccount(account);
    }

    async addNewAccount(email: string, password?: string, password_check?: string): Promise<UI_Account> {
        let account: DB_Account;
        if (password && password_check) {
            account = await this.createAccount({password, password_check, email});
            await dispatch_onNewUserRegistered.dispatchModuleAsync([getUIAccount(account)]);
        } else
            account = await this.createSAML(email);

        return getUIAccount(account);
    }

    async changePassword(userEmail: string, newPassword: string, _transaction?: FirestoreTransaction) {
        const email = userEmail.toLowerCase();
        const processor = async (transaction: FirestoreTransaction) => {
            const account = await transaction.queryUnique(this.accounts, {where: {email}});
            if (!account)
                throw new ApiException(422, "User with email does not exist");

            if (!account.saltedPassword || !account.salt)
                throw new ApiException(401, "Account login using SAML");

            account.saltedPassword = hashPasswordWithSalt(account.salt, newPassword);
            account._audit = auditBy(email, 'Changed password');

            return transaction.upsert(this.accounts, account);
        };

        if (_transaction)
            return processor(_transaction)

        return this.accounts.runInTransaction(processor);
    }

    async createAccount(request: Request_CreateAccount) {
        request.email = request.email.toLowerCase();
        validate(request.email, validateEmail);

        return this.accounts.runInTransaction(async (transaction: FirestoreTransaction) => {
            const account = await transaction.queryUnique(this.accounts, {where: {email: request.email}});
            if (account)
                throw new ApiException(422, "User with email already exists");

            return this.createImpl(request, transaction)
        });
    }

    private createImpl(request: Request_CreateAccount, transaction: FirestoreTransaction) {
        const salt = generateHex(32);
        const account = {
            _id: generateHex(32),
            _audit: auditBy(request.email),
            email: request.email,
            salt,
            saltedPassword: hashPasswordWithSalt(salt, request.password)
        };

        return transaction.insert(this.accounts, account);
    }

    async logout(sessionId: string) {
        const query = {where: {sessionId}};
        await this.sessions.deleteUnique(query);
    }

    async logoutAccount(accountId: string) {
        await this.sessions.delete({where: {userId: accountId}})
    }

    async login(request: Request_LoginAccount, response: ApiResponse): Promise<Response_Auth> {
        return this.loginValidate(request, response);
    }

    private async loginValidate(request: Request_LoginAccount): Promise<undefined>
    private async loginValidate(request: Request_LoginAccount, response?: ApiResponse): Promise<Response_Auth>
    private async loginValidate(request: Request_LoginAccount, response?: ApiResponse) {
        request.email = request.email.toLowerCase();
        const query = {where: {email: request.email}};
        const account = await this.accounts.queryUnique(query);
        if (!account)
            throw new ApiException(401, "account does not exists");

        if (!account.saltedPassword || !account.salt)
            throw new ApiException(401, "Account login using SAML");

        if (account.saltedPassword !== hashPasswordWithSalt(account.salt, request.password))
            throw new ApiException(401, "wrong username or password");

        if (!account._id) {
            account._id = generateHex(32);
            await this.accounts.upsert(account);
        }

        let sessionWithAccountId: Response_Auth | undefined
        if (response) {
            sessionWithAccountId = await this.upsertSession(account._id, request.frontType);
            this.setJWTinResp(response, sessionWithAccountId.jwt);
        }
        await dispatch_onUserLogin.dispatchModuleAsync([getUIAccount(account)]);
        return sessionWithAccountId;
    }

    async loginSAML(__email: string): Promise<Response_Auth> {
        const _email = __email.toLowerCase();
        const account = await this.createSAML(_email);

        const sessionWithAccountId = await this.upsertSession(account._id);
        await dispatch_onUserLogin.dispatchModuleAsync([getUIAccount(account)]);
        return sessionWithAccountId;
    }

    private async createSAML(__email: string) {
        const _email = __email.toLowerCase();
        const query = {where: {email: _email}};
        let dispatchEvent = false;
        const toRet = await this.accounts.runInTransaction<DB_Account>(async (transaction) => {
            const account = await transaction.queryUnique(this.accounts, query);
            if (account?._id)
                return account;

            const _account: DB_Account = {
                _id: generateHex(32),
                _audit: auditBy(_email),
                email: _email,
                ...account
            };

            dispatchEvent = true;
            return transaction.upsert(this.accounts, _account);
        });

        if (dispatchEvent)
            await dispatch_onNewUserRegistered.dispatchModuleAsync([getUIAccount(toRet)]);

        return toRet;
    }

    private isAuthRequest = (request: ExpressRequest) => request.header(SecretsModule.AUTHENTICATION_KEY) !== undefined;

    private verifyAccount(account: any): Response_Validation {
        if (!account)
            throw new BadImplementationException('Missing account in token payload')

        const email = account['email'];
        if (!email || typeof email !== 'string')
            throw new BadImplementationException('Missing email in token payload')

        const _id = account['_id'];
        if (!_id || typeof _id !== 'string')
            throw new BadImplementationException('Missing _id in token payload')

        return {_id, email}
    }

    async validateAuthenticationHeader(request: ExpressRequest, response?: ApiResponse): Promise<Response_Validation> {
        const token = SecretsModule.validateRequest(request);
        const payload = token.payload;
        const isExpired = SecretsModule.isExpired(token);
        const sessionId: string = payload.sessionId;
        if (!sessionId)
            throw new BadImplementationException(`Missing session id in token ${JSON.stringify(payload)}`)

        if (!isExpired) {
            const account = payload.account;
            this.verifyAccount(account);
            return account
        }

        const dbAccount = await this.validateSessionId(sessionId);
        if (response) {
            const jwt = this.generateJWT(dbAccount, sessionId);
            this.setJWTinResp(response, jwt);
        }

        return dbAccount;
    }

    setJWTinResp(response: ApiResponse, jwt: string) {
        // Set in header response
        response.setHeaders({[HeaderKey_JWT]: jwt})
    }

    public generateJWT(account: UI_Account, sessionId: string): string {
        return SecretsModule.generateJwt({
            account,
            sessionId,
            exp: currentTimeMillies() + this.config.sessionTTLms.jwt
        }, this.config.jwtSecretKey)
    }

    validateSession = async (request: ExpressRequest, response?: ApiResponse): Promise<Response_Validation> => {
        if (this.isAuthRequest(request))
            return this.validateAuthenticationHeader(request, response)

        return await this.validateSessionId(Header_SessionId.get(request));
    };

    async validateSessionId(sessionId: string) {
        const query = {where: {sessionId}};

        const session = await this.sessions.queryUnique(query);
        if (!session)
            throw new ApiException(401, `Invalid session id: ${sessionId}`);

        if (this.TTLExpired(session))
            throw new ApiException(401, "Session timed out");

        return await this.getUserEmailFromSession(session);
    }

    private async getUserEmailFromSession(session: DB_Session) {
        const account = await this.accounts.queryUnique({where: {_id: session.userId}});
        if (!account) {
            await this.sessions.deleteItem(session);
            throw new ApiException(403, `No user found for session: ${__stringify(session)}`);
        }

        return getUIAccount(account);
    }

    private TTLExpired = (session: DB_Session) => {
        const delta = currentTimeMillies() - session.timestamp;
        let sessionTTLms = this.config.sessionTTLms.web;

        if (session.frontType === FrontType.App)
            sessionTTLms = this.config.sessionTTLms.app;

        return delta > sessionTTLms || delta < 0;
    };

    public upsertSession = async (userId: string, frontType?: FrontType): Promise<Response_Auth> => {
        let session = await this.sessions.queryUnique({where: {userId}});
        if (!session || this.TTLExpired(session)) {
            session = {
                sessionId: generateHex(64),
                timestamp: currentTimeMillies(),
                userId
            };

            if (frontType)
                session.frontType = frontType;

            await this.sessions.upsert(session);
        }

        const account = await this.getUserEmailFromSession(session);
        const sessionId = session.sessionId;
        return {sessionId, jwt: this.generateJWT(account, sessionId), email: account.email, _id: account._id};
    };

    async assertApi(body: PostAssertBody, response: ApiResponse) {
        const options: RequestBody_SamlAssertOptions = {
            request_body: body
        };

        try {
            const data = await SamlModule.assert(options);
            this.logDebug(`Got data from assertion ${__stringify(data)}`);

            const email = data.userId;
            const loginData = await AccountModule.loginSAML(email);

            let redirectUrl = data.loginContext[QueryParam_RedirectUrl];

            redirectUrl = redirectUrl.replace(new RegExp(QueryParam_SessionId.toUpperCase(), "g"), loginData.sessionId);
            redirectUrl = redirectUrl.replace(new RegExp(QueryParam_Email.toUpperCase(), "g"), email);
            redirectUrl = redirectUrl.replace(new RegExp(QueryParam_JWT.toUpperCase(), "g"), loginData.jwt);

            return await response.redirect(302, redirectUrl);
        } catch (error) {
            throw new ApiException(401, 'Error authenticating user', error);
        }
    }

}


export const AccountModule = new AccountsModule_Class();
