
import {StormTester} from "@intuitionrobotics/thunderstorm/test-backend/StormTester";
import {__scenario} from "@intuitionrobotics/testelot";
import { FirebaseModule } from "@intuitionrobotics/firebase/app-backend/FirebaseModule";
import {
	deleteTest,
	ExampleModule,
	patchTest
} from "./tests/db-api-generator";
import {upsertAllTest} from "./tests/upsertAll";

export const mainScenario = __scenario("Tests for base-db-api-generator.");

mainScenario.add(upsertAllTest());
mainScenario.add(patchTest());
mainScenario.add(deleteTest());

module.exports = new StormTester()
	.addModules(FirebaseModule)
	.addModules(ExampleModule)
	.setScenario(mainScenario)
	.build();
