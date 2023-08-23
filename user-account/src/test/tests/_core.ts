
import {__custom} from "@intuitionrobotics/testelot";
import {AccountModule} from "../_main";

export function cleanup() {
	return __custom(async () => {
		const _AccountModule = AccountModule;
		// @ts-ignore
		for (const firestoreCollection of [_AccountModule.accounts, _AccountModule.sessions]) {
			await firestoreCollection.deleteAll();
		}
	}).setLabel("Clean up");
}
