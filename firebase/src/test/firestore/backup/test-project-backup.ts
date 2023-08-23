import {__custom, __scenario, Scenario} from "@intuitionrobotics/testelot";
import {Module} from "@intuitionrobotics/ts-common/core/module";
import {FirebaseModule} from "../../../main/app-backend/FirebaseModule";
import {FirestoreCollection} from "../../../main/app-backend/firestore/FirestoreCollection";

export const testFirestoreBackup: Scenario = __scenario("test-project-backup");
testFirestoreBackup.add(__custom(async () => {
    await TestModuleThatUsesCollection.deleteAllDocs();
    await TestModuleThatUsesCollection.insertTestDocument({label: "doc1"});
    await TestModuleThatUsesCollection.insertTestDocument({label: "doc2"});
}).setLabel("Populating collection"));

// testFirestoreBackup.add(__custom(async () => {
// 	await ProjectFirestoreBackup.backupProject("automation-test");
// }).setLabel("Backing up project.."));

class TestModuleThatUsesCollection_Class
    extends Module {
    private collection!: FirestoreCollection<any>;

    constructor() {
        super("TestModuleThatUsesCollection");
    }

    protected init(): void {
        this.collection = FirebaseModule.createAdminSession().getFirestore().getCollection("test-collection1");
    }

    async deleteAllDocs() {
        await this.collection.deleteAll();
    }

    async insertTestDocument(item: any) {
        await this.collection.insert(item);
    }
}

export const TestModuleThatUsesCollection = new TestModuleThatUsesCollection_Class();
