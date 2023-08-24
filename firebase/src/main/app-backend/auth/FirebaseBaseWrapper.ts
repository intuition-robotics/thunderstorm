import {FirebaseSession} from "./firebase-session";
import {Logger} from "@intuitionrobotics/ts-common/core/logger/Logger";

export abstract class FirebaseBaseWrapper
	extends Logger {

	public readonly firebaseSession: FirebaseSession<any, any>;

	protected constructor(firebaseSession: FirebaseSession<any, any>) {
		super();
		this.firebaseSession = firebaseSession;
	}

	isAdmin() {
		return this.firebaseSession.isAdmin();
	}
}
