import {XhrHttpModule} from "@intuitionrobotics/thunderstorm/app-frontend/modules/http/XhrHttpModule";
import {HttpMethod} from "@intuitionrobotics/thunderstorm/shared/types";
import {Module} from "@intuitionrobotics/ts-common/core/module";
import {ApiBugReport, Platform_Jira, Request_BugReport} from "../../shared/api";
import {Dialog_JiraOpened} from "../ui/Dialog_JiraOpened";
import {LogClient_MemBuffer} from "@intuitionrobotics/ts-common/core/logger/LogClient_MemBuffer";
import {LogLevel, LogLevelOrdinal} from "@intuitionrobotics/ts-common/core/logger/types";
import {BeLogged} from "@intuitionrobotics/ts-common/core/logger/BeLogged";

export const RequestKey_BugReportApi = "BugReport";

export class BugReportModule_Class
    extends Module {

    private readonly reports: LogClient_MemBuffer[] = [];

    constructor() {
        super("BugReportModule");
        this.reports.push(new LogClient_MemBuffer("default"))
        this.reports.push(new LogClient_MemBuffer("info").setFilter(level => LogLevelOrdinal.indexOf(level) >= LogLevelOrdinal.indexOf(LogLevel.Info)))
    }

    protected init(): void {
        this.reports.forEach(report => BeLogged.addClient(report));
    }

    sendBugReport = (subject: string, description: string, platforms?: string[]) => {
        const body: Request_BugReport = {
            subject,
            description,
            reports: this.reports.map(report => ({log: report.buffers, name: report.name})),
            platforms
        };

        XhrHttpModule
            .createRequest<ApiBugReport>(HttpMethod.POST, RequestKey_BugReportApi)
            .setJsonBody(body)
            .setRelativeUrl("/v1/bug-reports/report")
            .setOnError(() => this.logWarning(`Error updating the report`))
            .execute((response) => {
                const jiraTicket = response.find(ticket => ticket.platform === Platform_Jira);
                if (jiraTicket)
                    Dialog_JiraOpened.show(jiraTicket.issueId)
            });
    };
}

export const BugReportModule = new BugReportModule_Class();
