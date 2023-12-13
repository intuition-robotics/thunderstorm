
import {__scenario} from "@intuitionrobotics/testelot";
import {Tester} from "./_core/Tester";
import {FirebaseModule} from "@intuitionrobotics/firebase/backend";
import {PushPubSubModule} from "../main/app-backend/modules/PushPubSubModule";
import {scenarioCleanup} from "./cleaup";

const mainScenario = __scenario("Push Pub Sub Test");
mainScenario.add(scenarioCleanup);

module.exports = new Tester()
	.addModules(FirebaseModule, PushPubSubModule)
	.setScenario(mainScenario)
	.build();
