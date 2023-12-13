
import {__scenario} from "@intuitionrobotics/testelot";
import {JiraModule} from "../main/app-backend/modules/JiraModule";
import {Tester} from "./_core/Tester";
import {issueScenario} from "./jira/issue";

const mainScenario = __scenario("Bug Report Testing");
mainScenario.add(issueScenario);

const email = 'email';
const key = 'key';
JiraModule.setDefaultConfig({auth: {email: email, apiKey: key}});

module.exports = new Tester()
	.addModules(JiraModule)
	.setScenario(mainScenario)
	.build();
