import {FirebaseSession_Admin} from "./auth/FirebaseSession_Admin";
import {readFileSync} from "fs";
import {Firebase_UserCredential} from "./auth/firebase-session";
import {FirestoreCollection} from "./firestore/FirestoreCollection";
import {FirebaseProjectCollections} from "../shared/types";
import { Module } from "@intuitionrobotics/ts-common/core/module";
import {BadImplementationException, ImplementationMissingException, ThisShouldNotHappenException } from "@intuitionrobotics/ts-common/core/exceptions";
import { moduleResolver } from "@intuitionrobotics/ts-common/core/module-manager";
import { _keys } from "@intuitionrobotics/ts-common/utils/object-tools";
export type JWTInput = {
    type?: string;
    client_email?: string;
    private_key?: string;
    private_key_id?: string;
    project_id?: string;
    client_id?: string;
    client_secret?: string;
    refresh_token?: string;
    quota_project_id?: string;
}
type ConfigType = {
    [s: string]: string | JWTInput | Firebase_UserCredential;
};

export class FirebaseModule_Class
    extends Module<ConfigType> {

    // private readonly tokenSessions: { [s: string]: FirebaseSession_UserPassword; } = {};
    private readonly adminSessions: { [s: string]: FirebaseSession_Admin; } = {};
    public static localAdminConfigId: string;
    private localProjectId!: string;

    constructor() {
        super("FirebaseModule");
    }

    protected init(): void {
        this.localProjectId = this.deriveLocalProjectId();
    }

    getLocalProjectId(): string {
        return this.localProjectId;
    }

    private deriveLocalProjectId(): string {
        let projectId;
        if (FirebaseModule_Class.localAdminConfigId)
            if (!this.config[FirebaseModule_Class.localAdminConfigId])
                throw new ImplementationMissingException(`Forgot to define a service account for project Id: ${FirebaseModule_Class.localAdminConfigId}`);
            else
                projectId = FirebaseModule_Class.localAdminConfigId;

        if (!projectId)
            projectId = process.env.GCP_PROJECT;

        if (!projectId)
            projectId = process.env.GCLOUD_PROJECT;

        if (!projectId)
            throw new ThisShouldNotHappenException("Could not resolve project id...");

        return projectId;
    }

    protected connect(): Promise<void> {
        return new Promise<void>((resolve) => {
            resolve();
        });
    }

    protected disconnect(): Promise<void> {
        return new Promise<void>((resolve) => {
            resolve();
        });
    }

    // public async createSessionWithUsernameAndPassword(configId: string) {
    // 	let session = this.tokenSessions[configId];
    // 	if (session)
    // 		return session;
    //
    // 	const config = this.getProjectAuth(configId) as Firebase_UserCredential;
    // 	if (!config || !config.config || !config.credentials || !config.credentials.password || !config.credentials.user)
    // 		throw new BadImplementationException(`Config for key ${configId} is not a User & Password credentials pattern`);
    //
    // 	session = new FirebaseSession_UserPassword(config, configId);
    // 	this.tokenSessions[configId] = session;
    //
    // 	await session.connect();
    // 	return session;
    // }

    public createAdminSession(_projectId?: string, _sessionName?: string) {
        let projectId = _projectId;
        if (!projectId)
            projectId = this.localProjectId;

        const sessionName = _sessionName || projectId || "local-admin";
        let session = this.adminSessions[sessionName];
        if (session)
            return session;

        this.logInfo(`Creating Firebase session for project id: ${projectId}`);
        let config = this.getProjectAuth(projectId) as JWTInput | string | undefined;
        if (!config && _projectId && this.localProjectId && this.localProjectId !== _projectId)
            throw new BadImplementationException(`Config for key ${_projectId} is not defined`);

        if (typeof config === "string")
            config = JSON.parse(readFileSync(config, "utf8")) as JWTInput;

        if (config && (!config.client_email || !config.private_key))
            throw new BadImplementationException(`Config for key ${projectId} is not an Admin credentials pattern`);

        session = new FirebaseSession_Admin(sessionName, config);
        this.adminSessions[sessionName] = session;

        session.connect();
        return session;
    }

    getProjectAuth(projectId: string) {
        return this.config?.[projectId];
    }

    listCollectionsInModules() {
        const modules: Module[] = moduleResolver();
        const firebaseProjectCollections = modules.reduce((toRet, module) => {
            const keys = _keys(module);
            const _collections: FirestoreCollection<any>[] = keys
                .filter(key => typeof module[key] === "object" && module[key].constructor?.["name"].startsWith("FirestoreCollection"))
                .map(key => module[key] as unknown as FirestoreCollection<any>)
                .filter(collection => collection.wrapper.isAdmin());

            for (const collection of _collections) {
                const projectId = collection.wrapper.firebaseSession.getProjectId();
                const collectionName = collection.name;
                const project = toRet[projectId] || (toRet[projectId] = {projectId: projectId, collections: []});
                project.collections.push(collectionName);
            }

            return toRet;
        }, {} as { [k: string]: FirebaseProjectCollections });
        return Object.values(firebaseProjectCollections);
    }

}

export const FirebaseModule = new FirebaseModule_Class();
