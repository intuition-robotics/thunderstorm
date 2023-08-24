import {StormTester} from "@intuitionrobotics/thunderstorm/test-backend/StormTester";
import {
	createUser,
	testBadSessionID,
	testLoginWithWrongPass,
	testLoginWithWrongUser,
	testSuccessfulLogin
} from "./tests/create-user";
import {AccountModule} from "./_main";
import {__scenario} from "@intuitionrobotics/testelot";
import {FirebaseModule} from "@intuitionrobotics/firebase/app-backend/FirebaseModule";

export const mainScenario = __scenario("login");

mainScenario.add(createUser());
mainScenario.add(testSuccessfulLogin());
mainScenario.add(testLoginWithWrongPass());
mainScenario.add(testLoginWithWrongUser());
mainScenario.add(testBadSessionID());

module.exports = new StormTester()
	.addModules(FirebaseModule)
	.addModules(AccountModule)
	.setScenario(mainScenario)
	.build();





