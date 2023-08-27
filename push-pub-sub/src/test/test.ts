
import {__scenario} from "@intuitionrobotics/testelot";
import {Tester} from "./_core/Tester";
import {PushPubSubModule} from "../main/app-backend/modules/PushPubSubModule";
import {scenarioCleanup} from "./cleaup";
import {FirebaseModule} from "@intuitionrobotics/firebase/app-backend/FirebaseModule";

const mainScenario = __scenario("Push Pub Sub Test");
mainScenario.add(scenarioCleanup);

module.exports = new Tester()
    .addModules(
        FirebaseModule,
        PushPubSubModule
    )
    .setScenario(mainScenario)
    .build();
