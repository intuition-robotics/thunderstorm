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
	currentTimeMillies,
	Day,
	Dispatcher,
	generateHex,
	hashPasswordWithSalt,
	Module,
	validate
} from "@intuitionrobotics/ts-common";


import {
	FirebaseModule,
	FirestoreCollection,
	FirestoreTransaction
} from "@intuitionrobotics/firebase/backend";
import {
	DB_Account,
	DB_Session,
	FrontType,
	HeaderKey_SessionId,
	Request_CreateAccount,
	Request_LoginAccount,
	Request_UpsertAccount,
	Response_Auth,
	UI_Account,
	UI_Session
} from "./_imports";
import {
	ApiException,
	ExpressRequest,
	HeaderKey,
	QueryRequestInfo
} from "@intuitionrobotics/thunderstorm/backend";
import {validateEmail} from "@intuitionrobotics/db-api-generator/backend";

export const Header_SessionId = new HeaderKey(HeaderKey_SessionId);

type Config = {
	projectId: string
	sessionTTLms: { web: number, app: number }
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
		super();
		this.setDefaultConfig({sessionTTLms: {web: Day, app: Day}});
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

	async listUsers() {
		return this.accounts.getAll(["_id",
		                             "email"]) as Promise<{ email: string, _id: string }[]>;
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
			                                                    "frontType"], where: {userId: account._id}
		                                           });
		return sessions.map((session: DB_Session) => {
			return {
				...session,
				isExpired: this.TTLExpired(session)
			}
		});
	}

	async create(request: Request_CreateAccount) {
		const account = await this.createAccount(request);

		const session = await this.login(request);
		await dispatch_onNewUserRegistered.dispatchModuleAsync(getUIAccount(account));
		return session;
	}

	async upsert(request: Request_UpsertAccount) {
		let callback: (() => Promise<void[]>) = () => Promise.resolve([])
		const account = await this.accounts.runInTransaction(async (transaction) => {
			const existAccount = await transaction.queryUnique(this.accounts, {where: {email: request.email}});
			if (existAccount)
				return this.changePassword(request.email, request.password, transaction);

			callback = async () => dispatch_onNewUserRegistered.dispatchModuleAsync(getUIAccount(account));
			return this.createImpl(request, transaction);
		});

		await this.loginValidate(request, false);
		await callback()
		return getUIAccount(account);
	}

	async addNewAccount(email: string, password?: string, password_check?: string): Promise<UI_Account> {
		let account: DB_Account;
		if (password && password_check) {
			account = await this.createAccount({password, password_check, email});
			await dispatch_onNewUserRegistered.dispatchModuleAsync(getUIAccount(account));
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

	async login(request: Request_LoginAccount): Promise<Response_Auth> {
		return await this.loginValidate(request);
	}

	private async loginValidate(request: Request_LoginAccount): Promise<Response_Auth>
	private async loginValidate(request: Request_LoginAccount, doCreateSession: false): Promise<undefined>
	private async loginValidate(request: Request_LoginAccount, doCreateSession = true) {
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
		if (doCreateSession)
			sessionWithAccountId = await this.upsertSession(account._id, request.frontType);

		await dispatch_onUserLogin.dispatchModuleAsync(getUIAccount(account));
		return sessionWithAccountId;
	}

	async loginSAML(__email: string): Promise<Response_Auth> {
		const _email = __email.toLowerCase();
		const account = await this.createSAML(_email);

		const sessionWithAccountId = await this.upsertSession(account._id);
		await dispatch_onUserLogin.dispatchModuleAsync(getUIAccount(account));
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
			await dispatch_onNewUserRegistered.dispatchModuleAsync(getUIAccount(toRet));

		return toRet;
	}

	async validateSession(request: ExpressRequest): Promise<UI_Account> {
		const sessionId = Header_SessionId.get(request);
		if (!sessionId)
			throw new ApiException(404, 'Missing sessionId');

		return this.validateSessionId(sessionId);
	}

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
		return {sessionId: session.sessionId, email: account.email, _id: account._id};
	};

}


export const AccountModule = new AccountsModule_Class();
