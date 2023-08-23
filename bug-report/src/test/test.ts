import {__scenario} from "@intuitionrobotics/testelot";
import {Tester} from "./_core/Tester";
import {issueScenario} from "./jira/issue";
import {JiraModule} from "@intuitionrobotics/jira/app-backend/modules/JiraModule";

const mainScenario = __scenario("Bug Report Testing");
mainScenario.add(issueScenario);

const email = 'email';
const key = 'key';
JiraModule.setDefaultConfig({auth: {email: email, apiKey: key}});

module.exports = new Tester()
    .addModules(JiraModule)
    .setScenario(mainScenario)
    .build();
