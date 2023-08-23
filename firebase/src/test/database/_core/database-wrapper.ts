import {
	__custom,
	ErrorPolicy
} from "@intuitionrobotics/testelot";
import { DatabaseWrapper } from "../../../main/app-backend/database/DatabaseWrapper";
import { FirebaseModule } from "../../../main/app-backend/FirebaseModule";

export class FirebaseDatabaseTester {

	processDirty(label: string, processor: (db: DatabaseWrapper) => Promise<void>) {
		return this.process(label, processor, false).setErrorPolicy(ErrorPolicy.ContinueOnError);
	}

	processClean(label: string, processor: (db: DatabaseWrapper) => Promise<void>) {
		return this.process(label, processor, true).setErrorPolicy(ErrorPolicy.ContinueOnError);
	}

	private process(label: string, processor: (db: DatabaseWrapper) => Promise<void>, clean: boolean) {
		return __custom(async () => {
			const db = FirebaseModule.createAdminSession().getDatabase();
			if (clean) {
				const config = await db.get('/_config');
				await db.delete('/', '/');
				config && await db.set('/_config', config);
			}
			return processor(db)
		}).setLabel(label);
	}
}

export const myDb = new FirebaseDatabaseTester();
