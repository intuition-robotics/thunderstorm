import {Logger} from "@intuitionrobotics/ts-common/core/logger/Logger";
import {BadImplementationException} from "@intuitionrobotics/ts-common/core/exceptions";
import {FirebaseType_DB} from "./types";
// tslint:disable:no-import-side-effect
import {
	onValue,
	ref,
	remove,
	set,
	update
} from "firebase/database";

export class DatabaseWrapper
	extends Logger {

	private readonly database: FirebaseType_DB;

	constructor(database: FirebaseType_DB) {
		super();
		this.database = database;
	}


	public async get<T>(path: string): Promise<T | null> {
		return new Promise<T | null>(async (resolve, reject) => {
			onValue(this.getRef(path), snapshot => {
				resolve(snapshot.val() as T);
			}, (error: Error) => {
				reject(error);
			}, {onlyOnce: true});
		});
	}

	public listen<T>(path: string, callback: (value: T) => void) {
		return onValue(this.getRef(path), snapshot => {
			callback(snapshot.val());
		}, (error: Error) => {
			throw new BadImplementationException(`Error while getting value from path: ${path}`, error);
		}, {onlyOnce: false});
	}

	public listenWithError<T>(path: string, callback: (value: T) => void, errorCallback: (error: Error) => void, onlyOnce = false) {
		return onValue(this.getRef(path), snapshot => {
			callback(snapshot.val());
		}, (error: Error) => errorCallback(error), {onlyOnce});
	}

	private getRef = (path: string) => ref(this.database, path);

	public async set<T>(path: string, value: T) {
		try {
			await set(this.getRef(path), value);
		} catch (e) {
			throw new BadImplementationException(`Error while setting value to path: ${path}`);
		}
	}

	/** @deprecated */
	public async update<T extends object>(path: string, value: T) {
		this.logWarning("update will be deprecated!! please use patch");
		return this.patch(path, value);
	}

	public async patch<T extends object>(path: string, value: T) {
		try {
			await update(this.getRef(path), value);
		} catch (e) {
			throw new BadImplementationException(`Error while updating value to path: ${path}`);
		}
	}

	/** @deprecated */
	public async remove<T>(path: string, assertionRegexp: string = "^/.*?/.*") {
		this.logWarning("remove will be deprecated!! please use delete");
		return this.delete(path, assertionRegexp);
	}

	public async delete<T>(path: string, assertionRegexp: string = "^/.*?/.*") {
		if (!path)
			throw new BadImplementationException(`Falsy value, path: '${path}'`);

		if (!path.match(new RegExp(assertionRegexp)))
			throw new BadImplementationException(`path: '${path}'  does not match assertion: '${assertionRegexp}'`);

		try {
			await remove(this.getRef(path));
		} catch (e) {
			throw new BadImplementationException(`Error while removing path: ${path}`);
		}
	}
}
