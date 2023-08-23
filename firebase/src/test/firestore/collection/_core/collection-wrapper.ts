import {
	__custom,
	ErrorPolicy
} from "@intuitionrobotics/testelot";
import { FirebaseModule } from "../../../../main/app-backend/FirebaseModule";
import { FirestoreCollection } from "../../../../main/app-backend/firestore/FirestoreCollection";
import { FilterKeys } from "../../../../main/shared/types";

export class FirestoreCollection_Tester<DBType extends object> {
	private collectionName: string;
	private externalUniqueFilter?: FilterKeys<DBType>;


	constructor(collectionName: string, externalUniqueFilter?: FilterKeys<DBType>) {
		this.collectionName = collectionName;
		this.externalUniqueFilter = externalUniqueFilter;
	}

	processDirty(label: string, processor: (collection: FirestoreCollection<DBType>) => Promise<void>) {
		return this.process(label, processor, false).setErrorPolicy(ErrorPolicy.ContinueOnError);
	}

	processClean(label: string, processor: (collection: FirestoreCollection<DBType>) => Promise<void>) {
		return this.process(label, processor, true).setErrorPolicy(ErrorPolicy.ContinueOnError);
	}

	private process(label: string, processor: (collection: FirestoreCollection<DBType>) => Promise<void>, clean: boolean) {
		return __custom(async () => {
			const firestore = FirebaseModule.createAdminSession().getFirestore();
			const collection = firestore.getCollection<DBType>(this.collectionName, this.externalUniqueFilter);
			clean && await collection.deleteAll();
			return processor(collection)
		}).setLabel(label);
	}
}
