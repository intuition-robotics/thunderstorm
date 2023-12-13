
import {BugReportModule} from "../modules/BugReportModule";
import {AdminBRModule} from "../modules/AdminBRModule";
import {JiraBugReportIntegrator} from "../modules/JiraBugReportIntegrator";
import {JiraModule} from "@intuitionrobotics/jira";
import {SlackBugReportIntegrator} from "../modules/SlackBugReportIntegrator";
import {SlackModule} from "@intuitionrobotics/thunderstorm/app-backend/modules/SlackModule";


export const Backend_ModulePack_BugReport = [
	BugReportModule,
	AdminBRModule,
	JiraBugReportIntegrator,
	JiraModule,
	SlackBugReportIntegrator,
	SlackModule
];
