/*
 * Firebase is a simpler Typescript wrapper to all of firebase services.
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

/**
 * Created by tacb0ss on 25/08/2018.
 */

import {FirebaseSession} from "./auth/FirebaseSession";
import {SwFirebaseSession} from "./auth/SwFirebaseSession";
import {FirebaseConfig} from "../shared/types";
import { Module } from "@intuitionrobotics/ts-common/core/module";
import {BadImplementationException, ImplementationMissingException } from "@intuitionrobotics/ts-common/core/exceptions";

const localSessionId = 'local';

type ConfigType = {
	[s: string]: FirebaseConfig;
};

export class FirebaseModule_Class
	extends Module<ConfigType> {

	private sessions: { [projectId: string]: FirebaseSession } = {};
	private swSession?: SwFirebaseSession;

	constructor() {
		super("FirebaseModule");
	}


	async createSwSession(): Promise<SwFirebaseSession> {
		const swSession = this.swSession;
		if (swSession)
			return swSession;

		const localSession = await this.createLocalSession();

		return this.swSession = new SwFirebaseSession(localSessionId, localSession.app);
	}

	private async createLocalSession(token?: string): Promise<FirebaseSession> {
		let session = this.sessions[localSessionId];
		if (session)
			return session;

		let localConfig = this.getProjectAuth(localSessionId);
		if (!localConfig)
			localConfig = await this.fetchLocalConfig();

		this.checkConfig(localConfig, localSessionId);

		// I need to recheck because since it is an async op there might be race conditions
		session = this.sessions[localSessionId];
		if (session)
			return session;

		return this.initiateSession(localSessionId, localConfig, token);
	}

	private fetchLocalConfig = async () => {
		try {
			const resp = await fetch('/__/firebase/init.json');
			const config = await resp.json() as Promise<FirebaseConfig>;
			// @ts-ignore
			this.setConfig({[localSessionId]: config});
			return config;
		} catch (e) {
			throw new ImplementationMissingException(`Either specify configs for the 'FirebaseModule' or use SDK auto-configuration with firebase hosting`);
		}
	};

	public async createSession(projectId?: string | FirebaseConfig, token?: string) {
		if (!projectId)
			return this.createLocalSession(token);

		if (typeof projectId === "object")
			return this.createSessionWithConfigs(projectId, token);

		const session = this.sessions[projectId];
		if (session)
			return session;

		this.logInfo(`Creating session for config: ${projectId}`);
		const config = this.getProjectAuth(projectId);

		this.checkConfig(config, projectId);

		return this.initiateSession(projectId, config, token);
	}

	private async createSessionWithConfigs(config: FirebaseConfig, token?: string): Promise<FirebaseSession> {
		this.checkConfig(config, config.projectId);

		const sessionName = config.projectId + (token || '');
		const session = this.sessions[sessionName];
		if (session)
			return session;

		return this.initiateSession(sessionName, config, token);
	}

	private getProjectAuth(projectId: string) {
		return this.config?.[projectId];
	}

	private async initiateSession(sessionName: string, config: FirebaseConfig, token?: string) {
		const session = new FirebaseSession(sessionName, config);
		this.sessions[sessionName] = session;

		session.connect();

		if (token)
			await session.signInWithToken(token);

		return session;
	}

	private checkConfig(config: FirebaseConfig, projectId: string) {
		if (!config)
			throw new BadImplementationException('Did you forget to add FirebaseModule to the main.ts in the modules array?');

		if (!config || !config.projectId || !config.apiKey || !config.authDomain)
			throw new BadImplementationException(`Config for key ${projectId} is not an Admin credentials pattern`);

	}
}

export const FirebaseModule = new FirebaseModule_Class();
