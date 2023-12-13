
import {
	ImplementationMissingException,
	Module
} from "@intuitionrobotics/ts-common";
import {
	IssueType,
	JiraIssueText,
	JiraModule,
	JiraProject,
	LabelType
} from "@intuitionrobotics/jira";
import {
	Platform_Jira,
	ReportLogFile,
	Request_BugReport
} from "../..";
import {TicketDetails} from "./BugReportModule";

type Config = {
	jiraProject: JiraProject
	issueType: IssueType
	label: LabelType
}

export class JiraBugReportIntegrator_Class
	extends Module<Config> {

	constructor() {
		super("JiraBugReportIntegrator");
	}

	setIssueTitleProcessor(parser: (name: string) => string) {
		this.parser = parser;
	}

	private parser = (name: string) => `Bug: ${name}`;

	openTicket = async (bugReport: Request_BugReport, logs: ReportLogFile[], reporter?: string): Promise<TicketDetails | undefined> => {
		if (bugReport.platforms && !bugReport.platforms.includes(Platform_Jira))
			return;

		if (!this.config.jiraProject)
			throw new ImplementationMissingException("missing Jira project in bug report configurations");

		const description = logs.reduce((carry: JiraIssueText[], log: ReportLogFile, i: number) => {
			carry.push({href: log.path, text: "\nClick to view logs (" + i + ")"});
			return carry;
		}, [bugReport.description]);

		if (reporter)
			description.push("\nReported by: " + reporter);

		const issue = await JiraModule.issue.create(this.config.jiraProject, this.config.issueType, this.parser(bugReport.subject), description,
		                                            this.config.label?.label);
		return {platform: Platform_Jira, issueId: issue.url};
	};
}

export const JiraBugReportIntegrator = new JiraBugReportIntegrator_Class();
