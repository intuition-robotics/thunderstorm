
import {
	generateHex,
	ImplementationMissingException,
	Module
} from "@intuitionrobotics/ts-common";
import {
	Platform_Slack,
	ReportLogFile,
	Request_BugReport
} from "../..";
import {TicketDetails} from "./BugReportModule";
import {SlackModule} from "@intuitionrobotics/thunderstorm//app-backend/modules/SlackModule";

type Config = {
	channel: string
}

export class SlackBugReportIntegrator_Class
	extends Module<Config> {

	constructor() {
		super("SlackBugReportIntegrator");
	}

	openTicket = async (bugReport: Request_BugReport, logs: ReportLogFile[], reporter?: string): Promise<TicketDetails | undefined> => {
		if(bugReport.platforms && !bugReport.platforms.includes(Platform_Slack))
			return;

		if (!this.config.channel)
			throw new ImplementationMissingException("Missing Slack Channel in bug report configurations");

		let description = logs.reduce((carry: string, log: ReportLogFile, i: number) => {
			return carry + "\n" + `<${log.path}|Click to view logs (${i})>`;
		}, bugReport.subject + "\n" + bugReport.description);

		if (reporter)
			description += "\nReported by: " + reporter;

		const slackMessage = {
			text: description,
			channel: this.config.channel
		};
		await SlackModule.postMessage(slackMessage)
		return {platform: Platform_Slack, issueId: generateHex(32)};
	};
}

export const SlackBugReportIntegrator = new SlackBugReportIntegrator_Class();
