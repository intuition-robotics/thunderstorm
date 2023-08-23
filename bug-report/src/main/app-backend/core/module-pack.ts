import {BugReportModule} from "../modules/BugReportModule";
import {AdminBRModule} from "../modules/AdminBRModule";
import {JiraBugReportIntegrator} from "../modules/JiraBugReportIntegrator";
import {SlackBugReportIntegrator} from "../modules/SlackBugReportIntegrator";
import {SlackModule} from "@intuitionrobotics/thunderstorm/app-backend/modules/SlackModule";
import {JiraModule} from "@intuitionrobotics/jira/app-backend/modules/JiraModule";

export const Backend_ModulePack_BugReport = [
    BugReportModule,
    AdminBRModule,
    JiraBugReportIntegrator,
    JiraModule,
    SlackBugReportIntegrator,
    SlackModule
];
