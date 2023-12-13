
import {
	addItemToArray,
	BeLogged,
	LogClient_MemBuffer,
	LogLevel,
	LogLevelOrdinal,
	Module
} from "@intuitionrobotics/ts-common";
import {XhrHttpModule} from "@intuitionrobotics/thunderstorm/frontend";
import {HttpMethod} from "@intuitionrobotics/thunderstorm";
import {
	ApiBugReport,
	Platform_Jira,
	Request_BugReport
} from "../../shared/api";
import {Dialog_JiraOpened} from "../ui/Dialog_JiraOpened";

export const RequestKey_BugReportApi = "BugReport";

export class BugReportModule_Class
	extends Module {

	private readonly reports: LogClient_MemBuffer[] = [];

	constructor() {
		super("BugReportModule");
		addItemToArray(this.reports, new LogClient_MemBuffer("default"));
		addItemToArray(this.reports, new LogClient_MemBuffer("info")
			.setFilter(level => LogLevelOrdinal.indexOf(level) >= LogLevelOrdinal.indexOf(LogLevel.Info)));
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
				if(jiraTicket)
					Dialog_JiraOpened.show(jiraTicket.issueId)
			});
	};
}

export const BugReportModule = new BugReportModule_Class();
