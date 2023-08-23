import {FirebaseTester} from "./_core/Firebase-Tester";
import {testCollections} from "./firestore/collection/test-collections";
import {TestModuleThatUsesCollection,} from "./firestore/backup/test-project-backup";
import {FirebaseModule} from "../main/app-backend/FirebaseModule";
import {__scenario} from "@intuitionrobotics/testelot";
import {testDatabase} from "./database/test-database";

const mainScenario = __scenario("Firebase testing");
mainScenario.add(testDatabase)
mainScenario.add(testCollections);
module.exports = new FirebaseTester()
    .addModules(FirebaseModule,
        TestModuleThatUsesCollection)
    .setScenario(mainScenario)
    .build();
