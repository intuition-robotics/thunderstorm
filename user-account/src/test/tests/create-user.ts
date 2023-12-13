
import {
	__scenario,
	ContextKey,
    __custom
} from "@intuitionrobotics/testelot";
import {
	AccountModule,
	DB_Account
} from "../_main";
import {cleanup} from "./_core";
import {isErrorOfType} from "@intuitionrobotics/ts-common";
import {ApiException} from "@intuitionrobotics/thunderstorm/app-backend/exceptions";

const userContextKey1 = new ContextKey<DB_Account>("user-1");

export function createUser() {
	const scenario = __scenario("Create-User");
	scenario.add(cleanup());
	scenario.add(__custom(async () => {
		return await AccountModule.createAccount({email: "test-account1@gmail.com", password: "pah", password_check: "pah"});
	}).setWriteKey(userContextKey1));
	return scenario;
}

export function testSuccessfulLogin() {
	const scenario = __scenario("successful login");
	scenario.add(__custom(async () => {
		const responseAuth = await AccountModule.login({email: "test-account1@gmail.com", password: "pah"});
		await AccountModule.validateSessionId(responseAuth.sessionId);
	}).setReadKey(userContextKey1));
	return scenario;
}

export function testLoginWithWrongPass() {
	const scenario = __scenario("wrong pass");
	scenario.add(__custom(async () => {
		await AccountModule.login({email: "test-account1@gmail.com", password: "wrong"});
	}).setReadKey(userContextKey1).expectToFail(ApiException));
	return scenario;
}

export function testLoginWithWrongUser() {
	const scenario = __scenario("wrong user");
	scenario.add(__custom(async () => {
		await AccountModule.login({email: "wrong@gmail.com", password: "pah"});
	}).setReadKey(userContextKey1).expectToFail(ApiException));
	return scenario;
}

export function testBadSessionID() {
	const scenario = __scenario("bad session id");
	scenario.add(__custom(async () => {
		await AccountModule.validateSessionId("1234");
	}).setReadKey(userContextKey1).expectToFail(ApiException));
	return scenario;
}
