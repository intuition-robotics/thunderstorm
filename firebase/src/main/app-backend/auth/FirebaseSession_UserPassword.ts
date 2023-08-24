// import {
// 	auth,
// 	initializeApp
// } from "firebase";
//
// import {
// 	Firebase_UserCredential,
// 	FirebaseSession
// } from "./firebase-session";
//
//
// export class FirebaseSession_UserPassword
// 	extends FirebaseSession<Firebase_UserCredential> {
//
// 	private userCredential!: auth.UserCredential;
//
// 	constructor(config: Firebase_UserCredential, sessionName: string) {
// 		super(config, sessionName, false);
// 	}
//
// 	getProjectId(): string {
// 		return this.sessionName;
// 	}
//
// 	public async connect() {
// 		this.logDebug(`Connecting to firebase with config: ${this.config.config.id}`);
// 		this.app = initializeApp(this.config.config, this.config.config.id);
// 		this.userCredential = await auth(this.app).signInWithEmailAndPassword(this.config.credentials.user, this.config.credentials.password);
// 		const user = this.userCredential.user && this.userCredential.user;
// 		this.logDebug(`User: ${JSON.stringify(user)}`);
// 	}
// }
