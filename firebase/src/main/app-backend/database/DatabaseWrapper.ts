import {Firebase_DataSnapshot, Firebase_DB, FirebaseListener} from "./types";
import {FirebaseSession} from "../auth/firebase-session";
import {FirebaseBaseWrapper} from "../auth/FirebaseBaseWrapper";
import {getDatabase} from 'firebase-admin/database'
import {BadImplementationException} from "@intuitionrobotics/ts-common/core/exceptions";
import {ObjectTS} from "@intuitionrobotics/ts-common/utils/types";
import {calculateJsonSizeMb} from "@intuitionrobotics/ts-common/utils/tools";

export class DatabaseWrapper
    extends FirebaseBaseWrapper {

    private readonly database: Firebase_DB;

    constructor(firebaseSession: FirebaseSession<any, any>) {
        super(firebaseSession);
        this.database = getDatabase(firebaseSession.app)
    }

    public async get<T>(path: string, defaultValue?: T): Promise<T | undefined> {
        const snapshot = await this.database.ref(path).once("value");
        let toRet = defaultValue;
        if (snapshot)
            toRet = snapshot.val() as (T | undefined);

        if (!toRet)
            toRet = defaultValue;

        return toRet;
    }

    public listen<T>(path: string, callback: (value: T | undefined) => void): FirebaseListener {
        try {
            return this.database.ref(path).on("value", (snapshot: Firebase_DataSnapshot) => callback(snapshot ? snapshot.val() : undefined));
        } catch (e) {
            throw new BadImplementationException(`Error while getting value from path: ${path}`, e);
        }
    }

    public stopListening<T>(path: string, listener: FirebaseListener): void {
        try {
            this.database.ref(path).off("value", listener);
        } catch (e) {
            throw new BadImplementationException(`Error while getting value from path: ${path}`, e);
        }
    }

    public async set<T>(path: string, value: T) {
        try {
            return await this.database.ref(path).set(value);
        } catch (e) {
            throw new BadImplementationException(`Error while setting value to path: ${path}`, e);
        }
    }

    public async uploadByChunks(parentPath: string, data: ObjectTS, maxSizeMB: number = 3, itemsToRef: Promise<any>[] = []) {
        for (const key in data) {
            const node = `${parentPath}/${key}`;
            if (calculateJsonSizeMb(data[key]) < maxSizeMB)
                await this.set(node, data[key]);
            else
                await this.uploadByChunks(node, data[key], maxSizeMB, itemsToRef);
        }
    };

    public async update<T>(path: string, value: T) {
        this.logWarning("update will be deprecated!! please use patch");
        return this.patch(path, value);
    }

    public async patch<T>(path: string, value: T) {
        try {
            return await this.database.ref(path).update(value);
        } catch (e) {
            this.logError(e);
            throw new BadImplementationException(`Error while updating value to path: ${path}`, e);
        }
    }

    public async remove<T>(path: string, assertionRegexp: string = "^/.*?/.*") {
        this.logWarning("remove will be deprecated!! please use delete");
        return this.delete(path, assertionRegexp);
    }

    public async delete<T>(path: string, assertionRegexp: string = "^/.*?/.*"): Promise<T | undefined> {
        if (!path)
            throw new BadImplementationException(`Falsy value, path: '${path}'`);

        if (!path.match(new RegExp(assertionRegexp)))
            throw new BadImplementationException(`path: '${path}'  does not match assertion: '${assertionRegexp}'`);

        try {
            return new Promise<T>((resolve, reject) => {
                let val: T;
                this.database.ref(path).transaction(
                    (a: any) => {
                        val = a;
                        return null;
                    },
                    (error: Error | null, committed: boolean, snapshot: Firebase_DataSnapshot | null) => {
                        if (error)
                            return reject();

                        // Transaction aborted with return undefined
                        if (!committed)
                            return reject()

                        resolve(val)
                    }
                ).catch(reject)
            })
        } catch (e) {
            throw new BadImplementationException(`Error while removing path: ${path}`, e);
        }
    }

    getSdkInstance() {
        return this.database;
    }
}
